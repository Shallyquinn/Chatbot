import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationAnalyticsDto } from './create-conversation-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async upsertAnalytics(dto: CreateConversationAnalyticsDto) {
    return this.prisma.conversationAnalytics.upsert({
      where: { analytics_id: dto.session_id },
      update: {
        steps_completed: dto.steps_completed,
        widgets_interacted_with: dto.widgets_interacted_with,
        flows_attempted: dto.flows_attempted,
        total_user_messages: dto.total_user_messages,
        total_bot_messages: dto.total_bot_messages,
        total_button_clicks: dto.total_button_clicks,
        total_typed_responses: dto.total_typed_responses,
        session_abandonment_point: dto.session_abandonment_point,
        information_provided: dto.information_provided,
        goals_achieved: dto.goals_achieved,
        unresolved_concerns: dto.unresolved_concerns,
        satisfaction_rating: dto.satisfaction_rating,
        average_response_time_seconds: dto.average_response_time_seconds,
        errors_encountered: dto.errors_encountered,
      },
      create: {
        session_id: dto.session_id,
        user_id: dto.user_id,
        steps_completed: dto.steps_completed,
        widgets_interacted_with: dto.widgets_interacted_with,
        flows_attempted: dto.flows_attempted,
        total_user_messages: dto.total_user_messages,
        total_bot_messages: dto.total_bot_messages,
        total_button_clicks: dto.total_button_clicks,
        total_typed_responses: dto.total_typed_responses,
        session_abandonment_point: dto.session_abandonment_point,
        information_provided: dto.information_provided,
        goals_achieved: dto.goals_achieved,
        unresolved_concerns: dto.unresolved_concerns,
        satisfaction_rating: dto.satisfaction_rating,
        average_response_time_seconds: dto.average_response_time_seconds,
        errors_encountered: dto.errors_encountered,
      },
    });
  }

  async getAnalyticsBySession(sessionId: string) {
    return this.prisma.conversationAnalytics.findUnique({
      where: { session_id: sessionId },
    });
  }

  async getStats() {
    const totalSessions = await this.prisma.conversationAnalytics.count();

    const averageSatisfaction =
      await this.prisma.conversationAnalytics.aggregate({
        _avg: { satisfaction_rating: true },
      });

    const averageResponseTime =
      await this.prisma.conversationAnalytics.aggregate({
        _avg: { average_response_time_seconds: true },
      });

    return {
      totalSessions,
      averageSatisfaction: averageSatisfaction._avg.satisfaction_rating ?? 0,
      averageResponseTime:
        averageResponseTime._avg.average_response_time_seconds ?? 0,
    };
  }

  async getFlows() {
    const analytics = await this.prisma.conversationAnalytics.findMany({
      select: { flows_attempted: true },
    });

    const flowCount: Record<string, number> = {};
    analytics.forEach((a) => {
      (a.flows_attempted || []).forEach((flow) => {
        flowCount[flow] = (flowCount[flow] || 0) + 1;
      });
    });

    return Object.entries(flowCount)
      .map(([flow, count]) => ({ flow, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getAgentDashboardStats() {
    // Get total agents
    const totalAgents = await this.prisma.agent.count();

    // Get online agents
    const onlineAgents = await this.prisma.agent.count({
      where: { isOnline: true },
    });

    // Get waiting requests
    const waitingRequests = await this.prisma.conversationQueue.count({
      where: { status: 'WAITING' },
    });

    // Get active conversations
    const activeConversations = await this.prisma.conversation.count({
      where: { status: 'AGENT_ASSIGNED' },
    });

    // Get completed conversations (last 24 hours)
    const completedToday = await this.prisma.conversation.count({
      where: {
        status: 'COMPLETED',
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get average wait time for queue
    const queueItems = await this.prisma.conversationQueue.findMany({
      where: { status: 'WAITING' },
      select: { queuedAt: true },
    });

    const avgWaitTime =
      queueItems.length > 0
        ? queueItems.reduce((sum, item) => {
            const waitTime = Date.now() - item.queuedAt.getTime();
            return sum + waitTime;
          }, 0) / queueItems.length
        : 0;

    const avgWaitMinutes = Math.round(avgWaitTime / (1000 * 60));

    return {
      totalAgents,
      onlineAgents,
      offlineAgents: totalAgents - onlineAgents,
      waitingRequests,
      activeConversations,
      completedToday,
      avgWaitTime: avgWaitMinutes,
    };
  }
}
