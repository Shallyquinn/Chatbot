import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getQueueStatistics() {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      // Get queue counts
      const [total, waiting, assigned, resolved] = await Promise.all([
        this.prisma.conversation.count({
          where: {
            created_at: { gte: startOfDay },
          },
        }),
        this.prisma.conversation.count({
          where: {
            status: 'WAITING_FOR_AGENT',
          },
        }),
        this.prisma.conversation.count({
          where: {
            status: 'AGENT_ASSIGNED',
          },
        }),
        this.prisma.conversation.count({
          where: {
            status: 'RESOLVED',
            completedAt: { gte: startOfDay },
          },
        }),
      ]);

      // Calculate average wait time for conversations assigned today
      const assignedConversations = await this.prisma.conversation.findMany({
        where: {
          assignedAgentId: { not: null },
          assignedAt: { gte: startOfDay },
        },
        select: {
          created_at: true,
          assignedAt: true,
        },
      });

      const avgWaitTime =
        assignedConversations.length > 0
          ? assignedConversations.reduce((sum, conv) => {
              const wait = conv.assignedAt
                ? (new Date(conv.assignedAt).getTime() -
                    new Date(conv.created_at).getTime()) /
                  1000
                : 0;
              return sum + wait;
            }, 0) / assignedConversations.length
          : 0;

      // Calculate average response time (first agent message after assignment)
      const resolvedToday = await this.prisma.conversation.findMany({
        where: {
          status: 'RESOLVED',
          completedAt: { gte: startOfDay },
          assignedAt: { not: null },
        },
        select: {
          assignedAt: true,
          agentMessages: {
            orderBy: { sentAt: 'asc' },
            take: 1,
            select: { sentAt: true },
          },
        },
      });

      const avgResponseTime =
        resolvedToday.length > 0
          ? resolvedToday.reduce((sum, conv) => {
              if (conv.agentMessages.length > 0 && conv.assignedAt) {
                const responseTime =
                  (new Date(conv.agentMessages[0].sentAt).getTime() -
                    new Date(conv.assignedAt).getTime()) /
                  1000;
                return sum + responseTime;
              }
              return sum;
            }, 0) /
            resolvedToday.filter((c) => c.agentMessages.length > 0).length
          : 0;

      return {
        total,
        waiting,
        assigned,
        resolved,
        avgWaitTime: Math.round(avgWaitTime),
        avgResponseTime: Math.round(avgResponseTime),
      };
    } catch (error) {
      this.logger.error('Error getting queue statistics:', error);
      throw error;
    }
  }

  async getAgentStatuses() {
    try {
      const agents = await this.prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          assignedConversations: {
            where: {
              status: 'ACTIVE',
            },
            select: {
              id: true,
              conversation: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      });

      // Get resolved conversation counts for all agents in parallel
      const agentStatuses = await Promise.all(
        agents.map(async (agent) => {
          const resolvedCount = await this.prisma.conversationAssignment.count({
            where: {
              agentId: agent.id,
              status: 'COMPLETED',
            },
          });

          return {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            status: agent.status.toLowerCase(),
            activeConversations: agent.assignedConversations.filter(
              (a) => a.conversation.status === 'AGENT_ASSIGNED',
            ).length,
            totalResolved: resolvedCount,
          };
        }),
      );

      return agentStatuses;
    } catch (error) {
      this.logger.error('Error getting agent statuses:', error);
      throw error;
    }
  }

  async getWaitingConversations(limit = 50, offset = 0) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          status: 'WAITING_FOR_AGENT',
        },
        orderBy: {
          created_at: 'asc',
        },
        take: limit,
        skip: offset,
        select: {
          conversation_id: true,
          user_id: true,
          created_at: true,
          user: {
            select: {
              selected_language: true,
            },
          },
          queue: {
            select: {
              priority: true,
            },
          },
        },
      });

      return conversations.map((conv) => ({
        id: conv.conversation_id,
        userId: conv.user_id || 'Unknown',
        userName: 'User',
        language: conv.user?.selected_language || 'en',
        waitTime: Math.floor(
          (Date.now() - new Date(conv.created_at).getTime()) / 1000,
        ),
        priority: conv.queue?.priority || 'NORMAL',
        createdAt: conv.created_at,
      }));
    } catch (error) {
      this.logger.error('Error getting waiting conversations:', error);
      throw error;
    }
  }

  async getDailyAnalytics(dateString?: string) {
    try {
      const targetDate = dateString ? new Date(dateString) : new Date();
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const [conversations, messages, escalations] = await Promise.all([
        this.prisma.conversation.groupBy({
          by: ['status'],
          where: {
            created_at: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          _count: true,
        }),
        this.prisma.agentMessage.count({
          where: {
            sentAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        }),
        this.prisma.conversation.count({
          where: {
            escalationStatus: { not: null },
            created_at: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        }),
      ]);

      return {
        date: targetDate.toISOString().split('T')[0],
        conversationsByStatus: conversations.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        totalMessages: messages,
        totalEscalations: escalations,
      };
    } catch (error) {
      this.logger.error('Error getting daily analytics:', error);
      throw error;
    }
  }
}
