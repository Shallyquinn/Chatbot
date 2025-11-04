import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface ConfigUpdateDto {
  key: string;
  value: string;
  category: 'MESSAGES' | 'OPTIONS' | 'SYSTEM' | 'UI_TEXT' | 'PROMPTS';
  language?: string;
}

export interface CreateAgentDto {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  password?: string;
  maxChats?: number;
}

export interface UpdateAgentDto {
  name?: string;
  email?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY';
  maxChats?: number;
}

export interface BulkAgentDto {
  firstName: string;
  lastName: string;
  email: string;
  state?: string;
  lga?: string;
  languages?: string;
  maxChats?: number;
}

export interface BulkAgentResult {
  success: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  failed: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export interface AssignConversationDto {
  conversationId: string;
  agentId: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface BulkAssignConversationsDto {
  conversationIds: string[];
  agentId?: string; // Optional: if not provided, use auto-assignment
  strategy?: 'AUTO' | 'MANUAL' | 'ROUND_ROBIN' | 'LEAST_BUSY';
}

export interface UpdateAdminProfileDto {
  name?: string;
  email?: string;
  profileImage?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard metrics
  async getDashboardMetrics() {
    const [
      totalConversations,
      activeConversations,
      queuedConversations,
      totalAgents,
      onlineAgents,
      avgResponseTimeData,
      satisfactionCounts,
    ] = await Promise.all([
      this.prisma.conversation.count(),
      this.prisma.conversation.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.conversationQueue.count({
        where: { status: 'WAITING' },
      }),
      this.prisma.agent.count(),
      this.prisma.agent.count({
        where: { isOnline: true },
      }),
      this.prisma.conversation.aggregate({
        _avg: { responseTime: true },
      }),
      this.prisma.conversation.groupBy({
        by: ['satisfaction'],
        _count: { satisfaction: true },
        where: {
          satisfaction: { not: null },
        },
      }),
    ]);

    // Calculate satisfaction metrics
    const satisfactionMap = {
      satisfied: 0,
      dissatisfied: 0,
      neutral: 0,
    };

    satisfactionCounts.forEach((item) => {
      const level = item.satisfaction?.toLowerCase();
      if (level === 'very_satisfied' || level === 'satisfied') {
        satisfactionMap.satisfied += item._count.satisfaction;
      } else if (level === 'very_dissatisfied' || level === 'dissatisfied') {
        satisfactionMap.dissatisfied += item._count.satisfaction;
      } else if (level === 'neutral') {
        satisfactionMap.neutral += item._count.satisfaction;
      }
    });

    // Convert response time to seconds
    const avgResponseTimeSeconds = avgResponseTimeData._avg.responseTime || 0;
    const avgResponseTime =
      avgResponseTimeSeconds >= 60
        ? `${Math.round(avgResponseTimeSeconds / 60)}m`
        : `${Math.round(avgResponseTimeSeconds)}s`;

    return {
      overview: {
        totalConversations,
        activeConversations,
        queuedConversations,
        totalAgents,
        onlineAgents,
        avgResponseTime,
      },
      satisfaction: satisfactionMap,
    };
  }

  // Configuration management
  async getAllConfigs() {
    return this.prisma.chatbotConfig.findMany({
      include: {
        updatedByAdmin: {
          select: { name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConfigsByCategory(category: string) {
    return this.prisma.chatbotConfig.findMany({
      where: { category: category as any },
      orderBy: { key: 'asc' },
    });
  }

  async updateConfig(configDto: ConfigUpdateDto, adminId: string) {
    return this.prisma.chatbotConfig.upsert({
      where: { key: configDto.key },
      update: {
        value: configDto.value,
        category: configDto.category,
        language: configDto.language || 'en',
        updatedBy: adminId,
      },
      create: {
        key: configDto.key,
        value: configDto.value,
        category: configDto.category,
        language: configDto.language || 'en',
        updatedBy: adminId,
      },
    });
  }

  // Agent management
  async getAllAgents() {
    return this.prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isOnline: true,
        currentChats: true,
        maxChats: true,
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            assignedConversations: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueuedConversations() {
    const queueItems = await this.prisma.conversationQueue.findMany({
      include: {
        conversation: {
          include: {
            user: true,
          },
        },
      },
      where: { status: 'WAITING' },
      orderBy: [{ priority: 'desc' }, { queuedAt: 'asc' }],
    });

    // Transform to match frontend expectations
    return queueItems.map((item, index) => {
      const waitMinutes = Math.floor(
        (Date.now() - new Date(item.queuedAt).getTime()) / 60000,
      );

      const waitTime =
        waitMinutes >= 60
          ? `${Math.floor(waitMinutes / 60)}h ${waitMinutes % 60}m`
          : `${waitMinutes}m`;

      return {
        id: item.id,
        conversationId: item.conversationId,
        user: {
          name: `User ${item.conversation.user.user_session_id.slice(0, 8)}`,
        },
        escalatedAt: item.conversation.escalatedAt?.toISOString(),
        position: index + 1,
        waitTime,
      };
    });
  }

  // Conversation analytics
  async getConversationAnalytics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conversations = await this.prisma.conversation.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
      },
      select: {
        created_at: true,
        status: true,
        satisfaction: true,
        responseTime: true,
      },
    });

    return {
      totalConversations: conversations.length,
      completedConversations: conversations.filter(
        (c) => c.status === 'COMPLETED',
      ).length,
      avgSatisfaction:
        conversations.reduce(
          (acc, c) =>
            c.satisfaction
              ? acc + this.mapSatisfactionToNumber(c.satisfaction)
              : acc,
          0,
        ) / conversations.filter((c) => c.satisfaction).length || 0,
      avgResponseTime:
        conversations.reduce((acc, c) => acc + (c.responseTime || 0), 0) /
          conversations.length || 0,
    };
  }

  private mapSatisfactionToNumber(satisfaction: string): number {
    const mapping: Record<string, number> = {
      VERY_SATISFIED: 5,
      SATISFIED: 4,
      NEUTRAL: 3,
      DISSATISFIED: 2,
      VERY_DISSATISFIED: 1,
    };
    return mapping[satisfaction] || 3;
  }

  // Agent CRUD operations
  async createAgent(createAgentDto: CreateAgentDto) {
    const { firstName, lastName, email, password, maxChats } = createAgentDto;

    // Check if email already exists
    const existingAgent = await this.prisma.agent.findUnique({
      where: { email },
    });

    if (existingAgent) {
      throw new ConflictException('Agent with this email already exists');
    }

    // Generate default password if not provided
    const agentPassword = password || 'agent123';
    const hashedPassword = await bcrypt.hash(agentPassword, 10);

    const agent = await this.prisma.agent.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        status: 'OFFLINE',
        maxChats: maxChats || 5,
        isOnline: false,
      },
    });

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        status: agent.status,
        maxChats: agent.maxChats,
        createdAt: agent.createdAt,
      },
      temporaryPassword: agentPassword,
    };
  }

  async bulkCreateAgents(agents: BulkAgentDto[]): Promise<BulkAgentResult> {
    const result: BulkAgentResult = {
      success: [],
      failed: [],
    };

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Validate required fields
        if (!agent.firstName || !agent.lastName || !agent.email) {
          result.failed.push({
            row: rowNumber,
            email: agent.email || 'N/A',
            error: 'Missing required fields (firstName, lastName, email)',
          });
          continue;
        }

        // Check if email already exists
        const existingAgent = await this.prisma.agent.findUnique({
          where: { email: agent.email },
        });

        if (existingAgent) {
          result.failed.push({
            row: rowNumber,
            email: agent.email,
            error: 'Email already exists',
          });
          continue;
        }

        // Create agent with default password
        const defaultPassword = 'agent123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const createdAgent = await this.prisma.agent.create({
          data: {
            name: `${agent.firstName} ${agent.lastName}`,
            email: agent.email,
            password: hashedPassword,
            status: 'OFFLINE',
            maxChats: agent.maxChats || 5,
            isOnline: false,
            state: agent.state || null,
            lga: agent.lga || null,
            languages: agent.languages || null,
          },
        });

        result.success.push({
          id: createdAgent.id,
          name: createdAgent.name,
          email: createdAgent.email,
        });
      } catch (error) {
        result.failed.push({
          row: rowNumber,
          email: agent.email,
          error: error.message || 'Failed to create agent',
        });
      }
    }

    return result;
  }

  async updateAgent(agentId: string, updateAgentDto: UpdateAgentDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        ...updateAgentDto,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isOnline: true,
        currentChats: true,
        maxChats: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteAgent(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        assignedConversations: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if agent has active conversations
    if (agent.assignedConversations.length > 0) {
      throw new BadRequestException(
        'Cannot delete agent with active conversations. Please reassign or complete their conversations first.',
      );
    }

    // Get the default/dummy agent for reassignment
    const dummyAgent = await this.prisma.agent.findUnique({
      where: { email: 'dummy@honeychatbot.com' },
    });

    if (!dummyAgent) {
      throw new Error('Default agent not found in system');
    }

    // Reassign all conversations to dummy agent
    await this.prisma.$transaction([
      // Update all historical assignments
      this.prisma.conversationAssignment.updateMany({
        where: {
          agentId,
          status: { not: 'ACTIVE' },
        },
        data: {
          agentId: dummyAgent.id,
        },
      }),
      // Update conversations
      this.prisma.conversation.updateMany({
        where: { assignedAgentId: agentId },
        data: { assignedAgentId: dummyAgent.id },
      }),
      // Delete the agent
      this.prisma.agent.delete({
        where: { id: agentId },
      }),
    ]);

    return { success: true, message: 'Agent deleted successfully' };
  }

  async getAgentById(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isOnline: true,
        currentChats: true,
        maxChats: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        assignedConversations: {
          where: { status: 'ACTIVE' },
          include: {
            conversation: {
              include: {
                user: {
                  select: { user_session_id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async reassignConversation(assignmentDto: AssignConversationDto) {
    const { conversationId, agentId, priority } = assignmentDto;

    // Verify agent exists and is available
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (!agent.isOnline) {
      throw new BadRequestException('Agent is not online');
    }

    if (agent.currentChats >= agent.maxChats) {
      throw new BadRequestException('Agent has reached maximum chat capacity');
    }

    // Check if conversation has an active assignment
    const existingAssignment =
      await this.prisma.conversationAssignment.findFirst({
        where: {
          conversationId,
          status: 'ACTIVE',
        },
      });

    if (existingAssignment) {
      // Reassign from current agent to new agent
      await this.prisma.$transaction([
        // Mark old assignment as transferred
        this.prisma.conversationAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            status: 'TRANSFERRED',
            completedAt: new Date(),
          },
        }),
        // Decrement old agent's chat count
        this.prisma.agent.update({
          where: { id: existingAssignment.agentId },
          data: {
            currentChats: { decrement: 1 },
          },
        }),
        // Create new assignment
        this.prisma.conversationAssignment.create({
          data: {
            conversationId,
            agentId,
            status: 'ACTIVE',
            priority: priority || 'NORMAL',
          },
        }),
        // Increment new agent's chat count
        this.prisma.agent.update({
          where: { id: agentId },
          data: {
            currentChats: { increment: 1 },
          },
        }),
        // Update conversation
        this.prisma.conversation.update({
          where: { conversation_id: conversationId },
          data: {
            status: 'AGENT_ASSIGNED',
            assignedAgentId: agentId,
            assignedAt: new Date(),
          },
        }),
        // Remove from queue if exists
        this.prisma.conversationQueue.deleteMany({
          where: { conversationId },
        }),
      ]);
    } else {
      // New assignment from queue
      await this.prisma.$transaction([
        // Create assignment
        this.prisma.conversationAssignment.create({
          data: {
            conversationId,
            agentId,
            status: 'ACTIVE',
            priority: priority || 'NORMAL',
          },
        }),
        // Increment agent's chat count
        this.prisma.agent.update({
          where: { id: agentId },
          data: {
            currentChats: { increment: 1 },
          },
        }),
        // Update conversation
        this.prisma.conversation.update({
          where: { conversation_id: conversationId },
          data: {
            status: 'AGENT_ASSIGNED',
            assignedAgentId: agentId,
            assignedAt: new Date(),
          },
        }),
        // Remove from queue
        this.prisma.conversationQueue.deleteMany({
          where: { conversationId },
        }),
      ]);
    }

    return { success: true, message: 'Conversation assigned successfully' };
  }

  /**
   * Bulk assign conversations to agents
   * Supports manual assignment to specific agent or automatic smart assignment
   */
  async bulkAssignConversations(bulkAssignDto: BulkAssignConversationsDto) {
    const { conversationIds, agentId, strategy = 'AUTO' } = bulkAssignDto;

    if (conversationIds.length === 0) {
      throw new BadRequestException('No conversations provided for assignment');
    }

    const results = {
      success: [] as string[],
      failed: [] as { conversationId: string; error: string }[],
    };

    if (strategy === 'MANUAL' && agentId) {
      // Manual bulk assignment to specific agent
      for (const conversationId of conversationIds) {
        try {
          await this.reassignConversation({ conversationId, agentId });
          results.success.push(conversationId);
        } catch (error) {
          results.failed.push({
            conversationId,
            error: error.message || 'Failed to assign conversation',
          });
        }
      }
    } else {
      // Automatic smart assignment
      for (const conversationId of conversationIds) {
        try {
          const assignedAgentId = await this.autoAssignConversation(
            conversationId,
            strategy,
          );
          if (assignedAgentId) {
            results.success.push(conversationId);
          } else {
            results.failed.push({
              conversationId,
              error: 'No available agents found',
            });
          }
        } catch (error) {
          results.failed.push({
            conversationId,
            error: error.message || 'Failed to auto-assign conversation',
          });
        }
      }
    }

    return {
      success: true,
      message: `Assigned ${results.success.length} of ${conversationIds.length} conversations`,
      results,
    };
  }

  /**
   * Automatically assign a conversation to the best available agent
   * Based on: online status, capacity, location, language
   */
  async autoAssignConversation(
    conversationId: string,
    strategy: 'AUTO' | 'ROUND_ROBIN' | 'LEAST_BUSY' = 'AUTO',
  ): Promise<string | null> {
    // Get conversation details with user info
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
      include: {
        user: {
          select: {
            selected_state: true,
            selected_lga: true,
            selected_language: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Get all available online agents with capacity
    const availableAgents = await this.prisma.agent.findMany({
      where: {
        isOnline: true,
        status: 'ONLINE',
        currentChats: {
          lt: this.prisma.agent.fields.maxChats,
        },
      },
      include: {
        _count: {
          select: {
            assignedConversations: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (availableAgents.length === 0) {
      // No agents available
      return null;
    }

    let selectedAgent: (typeof availableAgents)[0] | null = null;

    if (strategy === 'LEAST_BUSY') {
      // Assign to agent with least active chats
      selectedAgent = availableAgents.reduce((prev, current) => {
        return current.currentChats < prev.currentChats ? current : prev;
      });
    } else if (strategy === 'ROUND_ROBIN') {
      // Simple round-robin: find agent with oldest last assignment
      selectedAgent = availableAgents.sort(
        (a, b) =>
          (a.lastActiveAt?.getTime() || 0) - (b.lastActiveAt?.getTime() || 0),
      )[0];
    } else {
      // AUTO: Smart assignment based on location, language, and capacity
      const userState = conversation.user?.selected_state;
      const userLga = conversation.user?.selected_lga;
      const userLanguage = conversation.user?.selected_language;

      // Score each agent
      const scoredAgents = availableAgents.map((agent) => {
        let score = 0;

        // Location match (highest priority)
        if (userState && agent.state === userState) {
          score += 50;
          if (userLga && agent.lga === userLga) {
            score += 30; // Same LGA is even better
          }
        }

        // Language match
        if (userLanguage && (agent as any).languages) {
          const agentLanguages = ((agent as any).languages as string)
            .split(',')
            .map((l) => l.trim().toLowerCase());
          if (agentLanguages.includes(userLanguage.toLowerCase())) {
            score += 40;
          }
        }

        // Capacity (prefer agents with more available slots)
        const availableSlots = agent.maxChats - agent.currentChats;
        score += availableSlots * 5;

        // Penalize busy agents
        const utilizationRate = agent.currentChats / agent.maxChats;
        score -= utilizationRate * 20;

        return { agent, score };
      });

      // Sort by score and pick the best
      scoredAgents.sort((a, b) => b.score - a.score);
      selectedAgent = scoredAgents[0]?.agent || null;
    }

    if (!selectedAgent) {
      return null;
    }

    // Assign the conversation
    try {
      await this.reassignConversation({
        conversationId,
        agentId: selectedAgent.id,
      });
      return selectedAgent.id;
    } catch (error) {
      console.error('Error auto-assigning conversation:', error);
      return null;
    }
  }

  /**
   * Background service to auto-assign queued conversations when admin is offline
   * This should be called periodically (e.g., every 30 seconds)
   */
  async autoAssignQueuedConversations() {
    // Get all waiting conversations
    const queuedConversations = await this.prisma.conversationQueue.findMany({
      where: { status: 'WAITING' },
      orderBy: [{ priority: 'desc' }, { queuedAt: 'asc' }],
      take: 10, // Process 10 at a time to avoid overload
    });

    const results = {
      assigned: 0,
      failed: 0,
    };

    for (const queueItem of queuedConversations) {
      try {
        const agentId = await this.autoAssignConversation(
          queueItem.conversationId,
          'AUTO',
        );
        if (agentId) {
          results.assigned++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(
          `Failed to auto-assign conversation ${queueItem.conversationId}:`,
          error,
        );
        results.failed++;
      }
    }

    return {
      success: true,
      message: `Auto-assigned ${results.assigned} conversations, ${results.failed} failed`,
      results,
    };
  }

  async getDummyAgent() {
    return this.prisma.agent.findUnique({
      where: { email: 'dummy@honeychatbot.com' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isOnline: true,
        maxChats: true,
      },
    });
  }

  // Admin Profile Management
  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return admin;
  }

  async updateAdminProfile(adminId: string, updateDto: UpdateAdminProfileDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // If email is being changed, check if it's already in use
    if (updateDto.email && updateDto.email !== admin.email) {
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { email: updateDto.email },
      });

      if (existingAdmin) {
        throw new ConflictException('Email is already in use');
      }
    }

    // If password is being changed, validate current password
    if (updateDto.newPassword) {
      if (!updateDto.currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isPasswordValid = await bcrypt.compare(
        updateDto.currentPassword,
        admin.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updateDto.name) updateData.name = updateDto.name;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.profileImage !== undefined)
      updateData.profileImage = updateDto.profileImage;
    if (updateDto.newPassword) {
      updateData.password = await bcrypt.hash(updateDto.newPassword, 10);
    }

    // Update admin profile
    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      admin: updatedAdmin,
    };
  }
}
