import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AgentInactivityService {
  private readonly logger = new Logger(AgentInactivityService.name);
  private readonly INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private prisma: PrismaService,
    private handoffDecisionService: HandoffDecisionService,
  ) {}

  /**
   * Check for inactive agents every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkInactiveAgents(): Promise<void> {
    this.logger.debug('Checking for inactive agents...');

    try {
      const inactiveThreshold = new Date(
        Date.now() - this.INACTIVITY_THRESHOLD_MS,
      );

      // Find agents with active conversations but inactive for > 15 minutes
      const inactiveAgents = await this.prisma.agent.findMany({
        where: {
          isOnline: true,
          currentChats: {
            gt: 0,
          },
          lastActiveAt: {
            lt: inactiveThreshold,
          },
        },
        include: {
          assignedConversations: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              conversation: {
                include: {
                  user: true,
                  user_responses: {
                    orderBy: {
                      created_at: 'desc',
                    },
                    take: 10, // Last 10 responses for context
                  },
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Found ${inactiveAgents.length} inactive agents with active chats`,
      );

      for (const agent of inactiveAgents) {
        await this.handleInactiveAgent(agent);
      }
    } catch (error) {
      this.logger.error(
        `Error checking inactive agents: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle an inactive agent - transfer all their conversations
   */
  private async handleInactiveAgent(agent: any): Promise<void> {
    this.logger.warn(
      `Agent ${agent.name} (${agent.id}) has been inactive for >15 minutes`,
    );

    const inactivityMinutes = Math.floor(
      (Date.now() - agent.lastActiveAt.getTime()) / 60000,
    );

    // Notify admins about inactive agent
    await this.notifyAdminsAboutInactiveAgent(
      agent.id,
      agent.name,
      inactivityMinutes,
    );

    // Transfer each active conversation
    for (const assignment of agent.assignedConversations) {
      await this.transferConversation(
        assignment.conversation,
        agent.id,
        inactivityMinutes,
      );
    }

    // Mark agent as AWAY
    await this.prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: 'AWAY',
        currentChats: 0,
      },
    });
  }

  /**
   * Transfer conversation from inactive agent to AI or chatbot
   */
  private async transferConversation(
    conversation: any,
    fromAgentId: string,
    inactivityMinutes: number,
  ): Promise<void> {
    this.logger.log(
      `Transferring conversation ${conversation.conversation_id} from inactive agent`,
    );

    try {
      // Analyze conversation to determine where to send it
      const handoffDecision =
        await this.handoffDecisionService.decideHandoffDestination(
          conversation,
        );

      // Record the handoff
      await this.prisma.conversationHandoff.create({
        data: {
          conversationId: conversation.conversation_id,
          fromType: 'agent',
          toType: handoffDecision.destination, // 'ai' or 'chatbot'
          fromAgentId,
          reason: 'agent_inactive',
          inactivityTime: inactivityMinutes,
          metadata: {
            lastAgentActivity: conversation.assignedAgent?.lastActiveAt,
            conversationContext: handoffDecision.context,
            decisionReason: handoffDecision.reason,
          },
        },
      });

      // Update conversation assignment
      await this.prisma.conversationAssignment.updateMany({
        where: {
          conversationId: conversation.conversation_id,
          agentId: fromAgentId,
          status: 'ACTIVE',
        },
        data: {
          status: 'ABANDONED',
          completedAt: new Date(),
        },
      });

      // Update conversation status
      await this.prisma.conversation.update({
        where: { conversation_id: conversation.conversation_id },
        data: {
          assignedAgentId: null,
          escalationStatus: null,
        },
      });

      // Send notification to user
      await this.notifyUserAboutHandoff(
        conversation.user_id,
        conversation.conversation_id,
        handoffDecision.destination,
      );

      this.logger.log(
        `Conversation ${conversation.conversation_id} transferred to ${handoffDecision.destination}`,
      );
    } catch (error) {
      this.logger.error(
        `Error transferring conversation ${conversation.conversation_id}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Notify admins about inactive agent
   */
  private async notifyAdminsAboutInactiveAgent(
    agentId: string,
    agentName: string,
    inactivityMinutes: number,
  ): Promise<void> {
    const admins = await this.prisma.admin.findMany();

    const notifications = admins.map((admin) => ({
      adminId: admin.id,
      type: 'AGENT_INACTIVE' as any,
      status: 'UNREAD' as any,
      title: 'Agent Inactive',
      message: `${agentName} has been inactive for ${inactivityMinutes} minutes. Their conversations have been transferred.`,
      metadata: {
        agentId,
        agentName,
        inactivityMinutes,
        timestamp: new Date().toISOString(),
      },
    }));

    await this.prisma.adminNotification.createMany({
      data: notifications,
    });
  }

  /**
   * Notify user that conversation is being handed back to chatbot/AI
   */
  private async notifyUserAboutHandoff(
    userId: string,
    conversationId: string,
    destination: string,
  ): Promise<void> {
    const message =
      destination === 'ai'
        ? "Your agent is currently unavailable. I'm connecting you with our AI assistant who can help answer your questions."
        : "Your agent is currently unavailable. I'll continue helping you with your request.";

    // Create a bot message in the conversation
    await this.prisma.conversation.create({
      data: {
        session_id: (
          await this.prisma.conversation.findUnique({
            where: { conversation_id: conversationId },
            select: { session_id: true },
          })
        ).session_id,
        user_id: userId,
        message_text: message,
        message_type: 'bot',
        chat_step: 'agent_handoff',
        message_source: 'system',
        message_sequence_number:
          await this.getNextSequenceNumber(conversationId),
      },
    });
  }

  /**
   * Get next sequence number for conversation
   */
  private async getNextSequenceNumber(conversationId: string): Promise<number> {
    const lastMessage = await this.prisma.conversation.findFirst({
      where: {
        conversation_id: conversationId,
      },
      orderBy: {
        message_sequence_number: 'desc',
      },
      select: {
        message_sequence_number: true,
      },
    });

    return (lastMessage?.message_sequence_number || 0) + 1;
  }

  /**
   * Manually trigger handoff check for a specific agent
   */
  async checkSpecificAgent(agentId: string): Promise<void> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        assignedConversations: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            conversation: {
              include: {
                user: true,
                user_responses: {
                  orderBy: {
                    created_at: 'desc',
                  },
                  take: 10,
                },
              },
            },
          },
        },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const inactiveThreshold = new Date(
      Date.now() - this.INACTIVITY_THRESHOLD_MS,
    );

    if (agent.lastActiveAt && agent.lastActiveAt < inactiveThreshold) {
      await this.handleInactiveAgent(agent);
    }
  }
}

/**
 * Service to decide where to handoff conversation: AI or Chatbot
 */
@Injectable()
export class HandoffDecisionService {
  private readonly logger = new Logger(HandoffDecisionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze conversation and decide if it should go to AI or chatbot
   */
  async decideHandoffDestination(conversation: any): Promise<{
    destination: 'ai' | 'chatbot';
    reason: string;
    context: any;
  }> {
    this.logger.log(
      `Analyzing conversation ${conversation.conversation_id} for handoff decision`,
    );

    // Get conversation context
    const responses = conversation.user_responses || [];
    const lastMessages = responses.slice(0, 5); // Last 5 messages

    // Check if user is in a structured flow
    const isInStructuredFlow =
      await this.isConversationInStructuredFlow(conversation);

    if (isInStructuredFlow) {
      return {
        destination: 'chatbot',
        reason:
          'User is in structured flow (FPM selection, demographics, etc.)',
        context: {
          currentStep: conversation.chat_step,
          flowType: this.identifyFlowType(conversation),
        },
      };
    }

    // Check if questions are generic (good for AI)
    const hasGenericQuestions = await this.hasGenericQuestions(lastMessages);

    if (hasGenericQuestions) {
      return {
        destination: 'ai',
        reason:
          'Conversation contains generic health questions suitable for AI',
        context: {
          questionTypes: this.categorizeQuestions(lastMessages),
          lastUserMessage: lastMessages[0]?.user_response,
        },
      };
    }

    // Check if user needs specific service (clinic referral, specific method info)
    const needsSpecificService = await this.needsSpecificService(conversation);

    if (needsSpecificService) {
      return {
        destination: 'chatbot',
        reason: 'User needs specific service that chatbot can handle',
        context: {
          serviceType: this.identifyServiceType(conversation),
        },
      };
    }

    // Default to AI for open-ended conversations
    return {
      destination: 'ai',
      reason: 'Open-ended conversation best handled by AI',
      context: {
        conversationLength: responses.length,
        topics: this.extractTopics(responses),
      },
    };
  }

  /**
   * Check if conversation is in a structured chatbot flow
   */
  private async isConversationInStructuredFlow(
    conversation: any,
  ): Promise<boolean> {
    const structuredSteps = [
      'language_selection',
      'gender_selection',
      'state_selection',
      'lga_selection',
      'age_selection',
      'marital_status_selection',
      'fpm_selection',
      'fpm_duration',
      'contraception_type',
      'emergency_product',
      'clinic_selection',
    ];

    return structuredSteps.includes(conversation.chat_step);
  }

  /**
   * Identify what type of flow the user is in
   */
  private identifyFlowType(conversation: any): string {
    if (conversation.chat_step?.includes('fpm'))
      return 'family_planning_methods';
    if (conversation.chat_step?.includes('clinic')) return 'clinic_referral';
    if (conversation.chat_step?.includes('demographics'))
      return 'demographics_collection';
    return 'general';
  }

  /**
   * Check if conversation has generic health questions
   */
  private async hasGenericQuestions(messages: any[]): Promise<boolean> {
    const genericKeywords = [
      'what is',
      'how does',
      'can you explain',
      'tell me about',
      'i want to know',
      'information about',
      'side effects',
      'how safe',
      'is it normal',
    ];

    const messageText = messages
      .map((m) => m.user_response?.toLowerCase() || '')
      .join(' ');

    return genericKeywords.some((keyword) => messageText.includes(keyword));
  }

  /**
   * Categorize question types
   */
  private categorizeQuestions(messages: any[]): string[] {
    const categories = [];
    const messageText = messages
      .map((m) => m.user_response?.toLowerCase() || '')
      .join(' ');

    if (messageText.includes('side effect')) categories.push('side_effects');
    if (messageText.includes('safe') || messageText.includes('safety'))
      categories.push('safety');
    if (messageText.includes('how') && messageText.includes('work'))
      categories.push('mechanism');
    if (messageText.includes('cost') || messageText.includes('price'))
      categories.push('cost');

    return categories;
  }

  /**
   * Check if user needs a specific service
   */
  private async needsSpecificService(conversation: any): Promise<boolean> {
    const serviceKeywords = [
      'clinic',
      'appointment',
      'location',
      'nearest',
      'find',
    ];

    const recentResponses = conversation.user_responses.slice(0, 3);
    const messageText = recentResponses
      .map((m) => m.user_response?.toLowerCase() || '')
      .join(' ');

    return serviceKeywords.some((keyword) => messageText.includes(keyword));
  }

  /**
   * Identify service type needed
   */
  private identifyServiceType(conversation: any): string {
    // Check FPM interactions
    if (conversation.current_fpm_method) return 'fpm_information';

    // Check user intention
    if (conversation.user_intention) return conversation.user_intention;

    return 'general_service';
  }

  /**
   * Extract topics from conversation
   */
  private extractTopics(responses: any[]): string[] {
    const topics = new Set<string>();

    responses.forEach((response) => {
      const text = response.user_response?.toLowerCase() || '';

      if (text.includes('pregnan')) topics.add('pregnancy');
      if (text.includes('period') || text.includes('menstrua'))
        topics.add('menstruation');
      if (text.includes('condom') || text.includes('pill'))
        topics.add('contraception');
      if (text.includes('std') || text.includes('sti'))
        topics.add('sexual_health');
    });

    return Array.from(topics);
  }
}
