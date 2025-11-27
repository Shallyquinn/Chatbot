import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface AgentLoginDto {
  email: string;
  password: string;
}

export interface AgentDashboardStats {
  activeConversations: number;
  queuedConversations: number;
  totalConversationsToday: number;
  averageResponseTime: number;
}

export interface ConversationInfo {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: Date;
  status: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async agentLogin(loginDto: AgentLoginDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { email: loginDto.email },
    });

    if (!agent) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      agent.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (agent.status === 'OFFLINE') {
      throw new ForbiddenException('Agent account is offline');
    }

    const payload = {
      sub: agent.id,
      email: agent.email,
      role: 'agent',
      name: agent.name,
    };

    // Update agent to online status
    await this.prisma.agent.update({
      where: { id: agent.id },
      data: {
        isOnline: true,
        lastActiveAt: new Date(),
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        isOnline: true,
        maxChats: agent.maxChats,
        currentChats: agent.currentChats,
      },
    };
  }

  async getAgentDashboard(agentId: string): Promise<AgentDashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeAssignments, queuedConversations, totalConversationsToday] =
      await Promise.all([
        // Active conversations assigned to this agent
        this.prisma.conversationAssignment.count({
          where: {
            agentId,
            status: 'ACTIVE',
          },
        }),

        // Queued conversations waiting for assignment
        this.prisma.conversationQueue.count({
          where: {
            status: 'WAITING',
          },
        }),

        // Total conversations handled today by this agent
        this.prisma.conversationAssignment.count({
          where: {
            agentId,
            assignedAt: {
              gte: today,
            },
          },
        }),
      ]);

    return {
      activeConversations: activeAssignments,
      queuedConversations,
      totalConversationsToday,
      averageResponseTime: 45, // Mock value for now
    };
  }

  async getAssignedConversations(agentId: string): Promise<ConversationInfo[]> {
    const assignments = await this.prisma.conversationAssignment.findMany({
      where: {
        agentId,
        status: 'ACTIVE',
      },
      include: {
        conversation: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      conversationId: assignment.conversationId,
      userId: assignment.conversation.user_id || 'anonymous',
      userName:
        assignment.conversation.user?.user_session_id || 'Anonymous User',
      lastMessage: assignment.conversation.message_text || 'No messages yet',
      lastMessageAt: assignment.conversation.created_at,
      status: assignment.status,
      priority: assignment.priority,
    }));
  }

  async getQueuedConversations(agentId: string): Promise<ConversationInfo[]> {
    const queuedItems = await this.prisma.conversationQueue.findMany({
      where: {
        status: 'WAITING',
      },
      include: {
        conversation: true,
        user: true,
      },
      orderBy: [
        { priority: 'desc' }, // Higher priority first
        { queuedAt: 'asc' }, // Then FIFO
      ],
      take: 20, // Limit to prevent overwhelming
    });

    return queuedItems.map((item) => ({
      id: item.id,
      conversationId: item.conversationId,
      userId: item.userId,
      userName: item.user?.user_session_id || 'Anonymous User',
      lastMessage: item.conversation?.message_text || 'No messages yet',
      lastMessageAt: item.conversation?.created_at || item.queuedAt,
      status: 'QUEUED',
      priority: item.priority,
    }));
  }

  async assignConversation(agentId: string, conversationId: string) {
    // Check if agent exists and is active
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent || !agent.isOnline) {
      throw new ForbiddenException('Agent not found or offline');
    }

    // Check if agent has reached max chat limit
    if (agent.currentChats >= agent.maxChats) {
      throw new ForbiddenException('Agent has reached maximum chat limit');
    }

    // Check if conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if already assigned
    const existingAssignment =
      await this.prisma.conversationAssignment.findFirst({
        where: {
          conversationId,
          status: 'ACTIVE',
        },
      });

    if (existingAssignment) {
      throw new ForbiddenException('Conversation already assigned');
    }

    // Create assignment and remove from queue
    const [assignment] = await this.prisma.$transaction([
      this.prisma.conversationAssignment.create({
        data: {
          conversationId,
          agentId,
          status: 'ACTIVE',
          priority: 'NORMAL',
        },
        include: {
          conversation: {
            include: {
              user: true,
            },
          },
        },
      }),
      // Remove from queue if it exists
      this.prisma.conversationQueue.deleteMany({
        where: { conversationId },
      }),
      // Update agent's current chat count
      this.prisma.agent.update({
        where: { id: agentId },
        data: {
          currentChats: {
            increment: 1,
          },
        },
      }),
      // Update conversation status
      this.prisma.conversation.update({
        where: { conversation_id: conversationId },
        data: {
          status: 'AGENT_ASSIGNED',
          assignedAt: new Date(),
          assignedAgentId: agentId,
        },
      }),
    ]);

    return assignment;
  }

  async unassignConversation(agentId: string, conversationId: string) {
    // Find the assignment
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId,
        agentId,
        status: 'ACTIVE',
      },
      include: {
        conversation: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Complete assignment and add back to queue
    await this.prisma.$transaction([
      this.prisma.conversationAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'TRANSFERRED',
          completedAt: new Date(),
        },
      }),
      // Add back to queue
      this.prisma.conversationQueue.create({
        data: {
          conversationId,
          userId: assignment.conversation.user_id || '',
          priority: 'NORMAL',
          status: 'WAITING',
        },
      }),
      // Update agent's current chat count
      this.prisma.agent.update({
        where: { id: agentId },
        data: {
          currentChats: {
            decrement: 1,
          },
        },
      }),
      // Update conversation status
      this.prisma.conversation.update({
        where: { conversation_id: conversationId },
        data: {
          status: 'WAITING_FOR_AGENT',
          assignedAt: null,
          assignedAgentId: null,
        },
      }),
    ]);

    return { success: true };
  }

  async updateAgentStatus(agentId: string, isOnline: boolean) {
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        isOnline,
        lastActiveAt: new Date(),
      },
    });
  }

  async sendMessage(agentId: string, conversationId: string, content: string) {
    // Verify the conversation is assigned to this agent
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId,
        agentId,
        status: 'ACTIVE',
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Conversation not found or not assigned to you',
      );
    }

    // Create the agent message
    const message = await this.prisma.agentMessage.create({
      data: {
        conversationId,
        agentId,
        messageText: content,
      },
    });

    return message;
  }

  async getAgentAvailability() {
    try {
      // Get all agents
      const agents = await this.prisma.agent.findMany({
        select: {
          id: true,
          isOnline: true,
          currentChats: true,
          maxChats: true,
        },
      });

      const totalAgents = agents.length;
      const onlineAgents = agents.filter((a) => a.isOnline).length;
      const availableAgents = agents.filter(
        (a) => a.isOnline && a.currentChats < a.maxChats,
      ).length;
      const busyAgents = agents.filter(
        (a) => a.isOnline && a.currentChats >= a.maxChats,
      ).length;

      // Get queue length
      const queueLength = await this.prisma.conversationQueue.count({
        where: { status: 'WAITING' },
      });

      // Calculate estimated wait time (basic formula: queueLength * 5 minutes / availableAgents)
      const estimatedWaitTime =
        availableAgents > 0
          ? Math.ceil((queueLength * 5) / availableAgents)
          : queueLength * 5;

      // Check business hours (configurable via environment variables)
      const businessHours = this.getBusinessHours();
      const isWithinBusinessHours = this.isWithinBusinessHours();

      return {
        totalAgents,
        onlineAgents,
        availableAgents,
        busyAgents,
        queueLength,
        estimatedWaitTime,
        isWithinBusinessHours,
        businessHours,
      };
    } catch (error) {
      console.error('Error getting agent availability:', error);
      throw error;
    }
  }

  private getBusinessHours() {
    return {
      start: process.env.BUSINESS_HOURS_START || '09:00',
      end: process.env.BUSINESS_HOURS_END || '17:00',
      timezone: process.env.BUSINESS_HOURS_TIMEZONE || 'UTC',
    };
  }

  private isWithinBusinessHours(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const businessHours = this.getBusinessHours();
    
    const startHour = parseInt(businessHours.start.split(':')[0]);
    const endHour = parseInt(businessHours.end.split(':')[0]);
    
    return hours >= startHour && hours < endHour;
  }
}
