import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from './websocket.service';

@Injectable()
export class AgentEscalationService {
  private readonly logger = new Logger(AgentEscalationService.name);

  constructor(
    private prisma: PrismaService,
    private websocketService: WebSocketService,
  ) {}

  async escalateToHuman(conversationId: string, userId: string) {
    // 1. Update conversation status
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        status: 'WAITING_FOR_AGENT',
        escalatedAt: new Date(),
        escalationReason: 'USER_REQUESTED',
      },
    });

    // 2. Find available agent
    const availableAgent = await this.findAvailableAgent();

    if (availableAgent) {
      // Auto-assign if agent available
      await this.assignConversation(conversationId, availableAgent.id);

      // Notify agent via WebSocket
      try {
        this.websocketService.notifyAgent(availableAgent.id, {
          type: 'NEW_ASSIGNMENT',
          conversationId,
          userId,
          priority: 'HIGH',
          message: 'New conversation assigned to you',
        });
        this.logger.log(
          `Notified agent ${availableAgent.id} of new assignment`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to notify agent ${availableAgent.id}:`,
          error,
        );
      }

      return {
        status: 'ASSIGNED',
        agentId: availableAgent.id,
        agentName: availableAgent.name,
        estimatedWaitTime: '< 1 minute',
      };
    } else {
      // Add to queue
      await this.addToQueue(conversationId, userId);

      // Get queue position
      const queueLength = await this.getQueueLength();

      // Notify admins of queue buildup
      if (queueLength > 5) {
        try {
          this.websocketService.notifyAdmins({
            type: 'QUEUE_ALERT',
            queueLength,
            message: 'Queue is getting long - consider bulk assignment',
          });
          this.logger.log(
            `Notified admins about queue buildup: ${queueLength} waiting`,
          );
        } catch (error) {
          this.logger.error(
            'Failed to notify admins about queue alert:',
            error,
          );
        }
      }

      return {
        status: 'QUEUED',
        position: queueLength,
        estimatedWaitTime: this.calculateWaitTime(queueLength),
      };
    }
  }

  async findAvailableAgent(): Promise<any> {
    // Find agents that are online and have capacity
    const agents: any = await this.prisma.$queryRaw`
      SELECT a.*,
             COALESCE(active_chats.count, 0) as current_chats
      FROM agents a
      LEFT JOIN (
        SELECT assigned_agent_id, COUNT(*) as count
        FROM conversations
        WHERE status = 'AGENT_ASSIGNED'
        GROUP BY assigned_agent_id
      ) active_chats ON a.id = active_chats.assigned_agent_id
      WHERE a.status = 'ONLINE'
        AND COALESCE(active_chats.count, 0) < a.max_concurrent_chats
      ORDER BY COALESCE(active_chats.count, 0) ASC
      LIMIT 1
    `;

    return agents.length > 0 ? agents[0] : null;
  }

  async assignConversation(conversationId: string, agentId: string) {
    // Update conversation with agent assignment
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        status: 'AGENT_ASSIGNED',
        assignedAgentId: agentId,
        assignedAt: new Date(),
      },
    });

    // Remove from queue if exists
    await this.prisma.conversationQueue.deleteMany({
      where: {
        conversationId: conversationId,
        status: 'WAITING',
      },
    });

    return { success: true };
  }

  async bulkAssignConversations(
    assignments: { agentId: string; conversationIds: string[] }[],
  ) {
    const results: any[] = [];

    for (const assignment of assignments) {
      try {
        for (const convId of assignment.conversationIds) {
          await this.assignConversation(convId, assignment.agentId);

          // Notify agent via WebSocket
          try {
            this.websocketService.notifyAgent(assignment.agentId, {
              type: 'BULK_ASSIGNMENT',
              conversationId: convId,
              totalAssigned: assignment.conversationIds.length,
              message: `You have been assigned ${assignment.conversationIds.length} conversations`,
            });
          } catch (error) {
            this.logger.error(
              `Failed to notify agent ${assignment.agentId}:`,
              error,
            );
          }
        }

        results.push({
          agentId: assignment.agentId,
          assigned: assignment.conversationIds.length,
          status: 'SUCCESS',
        });
      } catch (error: any) {
        results.push({
          agentId: assignment.agentId,
          assigned: 0,
          status: 'ERROR',
          error: error?.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  private async addToQueue(conversationId: string, userId: string) {
    await this.prisma.conversationQueue.create({
      data: {
        conversationId: conversationId,
        userId: userId,
        priority: 'NORMAL',
        queuedAt: new Date(),
        status: 'WAITING',
      },
    });
  }

  private async getQueueLength(): Promise<number> {
    return await this.prisma.conversationQueue.count({
      where: {
        status: 'WAITING',
      },
    });
  }

  private calculateWaitTime(queuePosition: number): string {
    const avgHandlingTime = 5; // minutes
    const estimatedMinutes = queuePosition * avgHandlingTime;

    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  // Get queue status for admin dashboard
  async getQueueStatus() {
    const queueItems = await this.prisma.conversationQueue.findMany({
      where: { status: 'WAITING' },
      include: {
        conversation: {
          include: {
            user: {
              select: {
                user_id: true,
                user_session_id: true,
                selected_language: true,
              },
            },
          },
        },
      },
      orderBy: { queuedAt: 'asc' },
    });

    return queueItems.map((item, index) => ({
      id: item.id,
      conversationId: item.conversationId,
      userId: item.userId,
      position: index + 1,
      waitTime: this.calculateWaitTime(index + 1),
      queuedAt: item.queuedAt,
      priority: item.priority,
      userLanguage: item.conversation?.user?.selected_language,
      estimatedWaitMinutes: (index + 1) * 5,
    }));
  }

  // Get agent workload for dashboard
  async getAgentWorkload() {
    const agentWorkload = await this.prisma.$queryRaw`
      SELECT
        a.agent_id,
        a.agent_name,
        a.agent_status,
        a.max_concurrent_chats,
        COALESCE(active_chats.count, 0) as current_active_chats,
        COALESCE(total_today.count, 0) as conversations_today
      FROM agents a
      LEFT JOIN (
        SELECT assigned_agent_id, COUNT(*) as count
        FROM conversations
        WHERE conversation_status = 'AGENT_ASSIGNED'
        GROUP BY assigned_agent_id
      ) active_chats ON a.agent_id = active_chats.assigned_agent_id
      LEFT JOIN (
        SELECT assigned_agent_id, COUNT(*) as count
        FROM conversations
        WHERE assigned_at >= CURRENT_DATE
        GROUP BY assigned_agent_id
      ) total_today ON a.agent_id = total_today.assigned_agent_id
      ORDER BY a.agent_name ASC
    `;

    return agentWorkload;
  }
}
