import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationStatus, AgentStatus } from '@prisma/client';

export interface EscalationRequest {
  conversationId: string;
  userId: string;
  sessionId: string;
  conversationSummary: {
    userId: string;
    conversationId: string;
    currentStep: string;
    language: string;
    recentMessages: Array<{
      text: string;
      type: string;
      timestamp: Date;
    }>;
    userProfile: {
      selectedGender?: string;
      selectedState?: string;
      selectedLGA?: string;
      selectedAge?: string;
      selectedMaritalStatus?: string;
    };
    fpmData: Record<string, unknown>;
  };
}

export interface AgentAssignment {
  conversationId: string;
  agentId: string;
}

export interface QueueStatusResult {
  totalInQueue: number;
  averageWaitTime: string;
  availableAgents: number;
}

export interface BulkAssignmentResult {
  conversationId: string;
  success: boolean;
  agentName?: string;
  error?: string;
}

@Injectable()
export class AgentEscalationService {
  constructor(private prisma: PrismaService) {}

  async escalateToHuman(request: EscalationRequest) {
    try {
      // Create a new conversation entry for the escalation
      const conversation = await this.prisma.conversation.create({
        data: {
          session: {
            connect: { session_id: request.sessionId },
          },
          user: {
            connect: { user_id: request.userId },
          },
          message_text: 'User requested human agent assistance',
          message_type: 'system',
          chat_step: 'agent_escalation',
          message_sequence_number: 1,
          status: ConversationStatus.WAITING_FOR_AGENT,
          escalatedAt: new Date(),
          escalationReason: 'User request',
        },
      });

      // Try to assign to available agent
      const availableAgent = await this.findAvailableAgent();

      if (availableAgent) {
        // Assign conversation to agent
        await this.prisma.conversation.update({
          where: { conversation_id: request.conversationId },
          data: {
            assignedAgentId: availableAgent.id,
            status: ConversationStatus.AGENT_ASSIGNED,
            assignedAt: new Date(),
          },
        });

        // Update agent status and chat count
        await this.prisma.agent.update({
          where: { id: availableAgent.id },
          data: {
            status: AgentStatus.BUSY,
            currentChats: {
              increment: 1,
            },
          },
        });

        return {
          status: 'ASSIGNED',
          agentId: availableAgent.id,
          agentName: availableAgent.name,
        };
      } else {
        // Add to queue
        const queuePosition = await this.getQueuePosition();
        const estimatedWaitTime =
          this.calculateEstimatedWaitTime(queuePosition);

        return {
          status: 'QUEUED',
          position: queuePosition,
          estimatedWaitTime,
        };
      }
    } catch (error) {
      console.error('Error during escalation:', error);
      throw new Error('Failed to escalate conversation');
    }
  }

  async findAvailableAgent() {
    return await this.prisma.agent.findFirst({
      where: {
        status: AgentStatus.ONLINE,
        currentChats: {
          lt: 5, // Max 5 concurrent conversations per agent
        },
      },
      orderBy: {
        currentChats: 'asc', // Assign to agent with least conversations
      },
    });
  }

  async bulkAssignConversations(
    assignments: AgentAssignment[],
  ): Promise<BulkAssignmentResult[]> {
    const results: BulkAssignmentResult[] = [];

    for (const assignment of assignments) {
      try {
        // Check if agent is available
        const agent = await this.prisma.agent.findUnique({
          where: { id: assignment.agentId },
        });

        if (!agent || agent.status !== AgentStatus.ONLINE) {
          results.push({
            conversationId: assignment.conversationId,
            success: false,
            error: 'Agent not available',
          });
          continue;
        }

        // Assign conversation
        await this.prisma.conversation.update({
          where: { conversation_id: assignment.conversationId },
          data: {
            assignedAgentId: assignment.agentId,
            status: ConversationStatus.AGENT_ASSIGNED,
            assignedAt: new Date(),
          },
        });

        // Update agent conversation count
        await this.prisma.agent.update({
          where: { id: assignment.agentId },
          data: {
            currentChats: {
              increment: 1,
            },
            status: AgentStatus.BUSY,
          },
        });

        results.push({
          conversationId: assignment.conversationId,
          success: true,
          agentName: agent.name,
        });
      } catch (error: any) {
        results.push({
          conversationId: assignment.conversationId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async getQueueStatus(): Promise<QueueStatusResult> {
    const [totalInQueue, availableAgents] = await Promise.all([
      this.prisma.conversation.count({
        where: { status: ConversationStatus.WAITING_FOR_AGENT },
      }),
      this.prisma.agent.count({
        where: { status: AgentStatus.ONLINE },
      }),
    ]);

    const averageWaitTime = this.calculateEstimatedWaitTime(totalInQueue);

    return {
      totalInQueue,
      averageWaitTime,
      availableAgents,
    };
  }

  private async getQueuePosition(): Promise<number> {
    const queueCount = await this.prisma.conversation.count({
      where: { status: ConversationStatus.WAITING_FOR_AGENT },
    });
    return queueCount + 1;
  }

  private calculateEstimatedWaitTime(position: number): string {
    // Simple calculation: assume 10 minutes per person in queue
    const estimatedMinutes = position * 10;

    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  // WebSocket integration methods (placeholder for future implementation)
  async notifyAgentAssignment(agentId: string, conversationId: string) {
    // TODO: Implement WebSocket notification to agent
    console.log(
      `Notifying agent ${agentId} of new conversation ${conversationId}`,
    );
  }

  async notifyQueueUpdate(
    userId: string,
    position: number,
    estimatedWaitTime: string,
  ) {
    // TODO: Implement WebSocket notification to user
    console.log(
      `Notifying user ${userId} of queue position ${position}, wait time ${estimatedWaitTime}`,
    );
  }
}
