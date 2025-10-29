import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentAssignmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Automatically assign a conversation to an agent using equal distribution logic
   * Assigns to the agent with the lowest current workload (active conversation count)
   */
  async autoAssignConversation(conversationId: string): Promise<any> {
    // Find the conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.assignedAgentId) {
      throw new BadRequestException('Conversation is already assigned');
    }

    // Get all active/online agents with their current workload
    const agents = await this.prisma.agent.findMany({
      where: {
        isOnline: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentChats: true,
      },
    });

    if (agents.length === 0) {
      throw new BadRequestException('No active agents available');
    }

    // Find the agent with the lowest workload
    const agentWithLowestWorkload = agents.reduce((prev, current) => {
      return current.currentChats < prev.currentChats ? current : prev;
    });

    // Assign the conversation to the agent
    const updatedConversation = await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        assignedAgentId: agentWithLowestWorkload.id,
        status: 'AGENT_ASSIGNED',
        escalatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            user_id: true,
            user_session_id: true,
          },
        },
      },
    });

    // TODO: Uncomment after migration - Log the assignment
    // await this.prisma.conversationLog.create({
    //   data: {
    //     conversationId: conversation.conversation_id,
    //     action: 'ASSIGNED',
    //     performedById: agentWithLowestWorkload.id,
    //     details: {
    //       assignmentType: 'AUTOMATIC',
    //       agentWorkload: agentWithLowestWorkload.currentChats,
    //     },
    //   },
    // });

    // Update agent's current chat count
    await this.prisma.agent.update({
      where: { id: agentWithLowestWorkload.id },
      data: {
        currentChats: {
          increment: 1,
        },
      },
    });

    return {
      ...updatedConversation,
      assignedAgent: {
        id: agentWithLowestWorkload.id,
        name: agentWithLowestWorkload.name,
        email: agentWithLowestWorkload.email,
      },
    };
  }

  /**
   * Manually assign a conversation to a specific agent
   */
  async manualAssignConversation(
    conversationId: string,
    agentId: string,
    assignedBy: string,
  ): Promise<any> {
    // Validate conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Validate agent exists and is active
    const agent = await this.prisma.agent.findUnique({
      where: {
        id: agentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentChats: true,
        isOnline: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found or not active');
    }

    // Assign the conversation
    const updatedConversation = await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        assignedAgentId: agentId,
        status: 'AGENT_ASSIGNED',
        escalatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            user_id: true,
            user_session_id: true,
          },
        },
      },
    });

    // TODO: Uncomment after migration - Log the assignment
    // await this.prisma.conversationLog.create({
    //   data: {
    //     conversationId: conversation.conversation_id,
    //     action: 'ASSIGNED',
    //     performedById: assignedBy,
    //     details: {
    //       assignmentType: 'MANUAL',
    //       targetAgentId: agentId,
    //       agentWorkload: agent.currentChats,
    //     },
    //   },
    // });

    // Update agent's current chat count
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        currentChats: {
          increment: 1,
        },
      },
    });

    return {
      ...updatedConversation,
      assignedAgent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
      },
    };
  }

  /**
   * Bulk assign multiple conversations to agents using equal distribution
   */
  async bulkAssignConversations(
    conversationIds: string[],
    assignedBy: string,
    specificAgentId?: string,
  ): Promise<any> {
    const results: {
      successful: any[];
      failed: Array<{ conversationId: string; error: string }>;
    } = {
      successful: [],
      failed: [],
    };

    if (specificAgentId) {
      // Assign all to a specific agent
      for (const conversationId of conversationIds) {
        try {
          const result = await this.manualAssignConversation(
            conversationId,
            specificAgentId,
            assignedBy,
          );
          results.successful.push(result);
        } catch (error) {
          results.failed.push({ conversationId, error: error.message });
        }
      }
    } else {
      // Auto-distribute among available agents
      for (const conversationId of conversationIds) {
        try {
          const result = await this.autoAssignConversation(conversationId);
          results.successful.push(result);
        } catch (error) {
          results.failed.push({ conversationId, error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Get unassigned conversation requests
   */
  async getUnassignedRequests(): Promise<any[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        assignedAgentId: null,
        status: 'WAITING_FOR_AGENT',
      },
      include: {
        user: {
          select: {
            user_id: true,
            user_session_id: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 50, // Limit to recent requests
    });

    return conversations.map((conv) => ({
      id: conv.conversation_id,
      userId: conv.user_id,
      userName: conv.user?.user_session_id || 'Anonymous User',
      lastMessage: conv.message_text || 'New conversation request',
      timestamp: conv.created_at,
      platform: 'whatsapp',
    }));
  }

  /**
   * Get agent statistics for dashboard
   */
  async getAgentDashboardStats(): Promise<{
    totalRequests: number;
    requestsChange: number;
    totalAgents: number;
    agentsChange: number;
    activeChats: number;
    chatsChange: number;
    responseTime: string;
    responseChange: number;
  }> {
    const [
      totalRequests,
      totalAgents,
      activeConversations,
      yesterdayRequests,
      yesterdayAgents,
      yesterdayChats,
    ] = await Promise.all([
      // Total unassigned requests
      this.prisma.conversation.count({
        where: {
          assignedAgentId: null,
          status: 'WAITING_FOR_AGENT',
        },
      }),
      // Total agents
      this.prisma.agent.count(),
      // Active chats
      this.prisma.conversation.count({
        where: {
          status: 'AGENT_ASSIGNED',
          assignedAgentId: { not: null },
        },
      }),
      // Yesterday's requests
      this.prisma.conversation.count({
        where: {
          assignedAgentId: null,
          status: 'WAITING_FOR_AGENT',
          created_at: {
            gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Yesterday's agents
      this.prisma.agent.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Yesterday's active chats
      this.prisma.conversation.count({
        where: {
          status: 'AGENT_ASSIGNED',
          assignedAt: {
            gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      totalRequests,
      requestsChange: calculateChange(totalRequests, yesterdayRequests),
      totalAgents,
      agentsChange: calculateChange(totalAgents, yesterdayAgents),
      activeChats: activeConversations,
      chatsChange: calculateChange(activeConversations, yesterdayChats),
      responseTime: '2.5s', // Placeholder - would need response time tracking
      responseChange: -3, // Placeholder - would need historical data
    };
  }
}
