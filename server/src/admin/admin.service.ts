import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConfigUpdateDto {
  key: string;
  value: string;
  category: 'MESSAGES' | 'OPTIONS' | 'SYSTEM' | 'UI_TEXT' | 'PROMPTS';
  language?: string;
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard metrics
  async getDashboardMetrics() {
    const [
      totalUsers,
      activeConversations,
      totalAgents,
      activeAgents,
      avgResponseTime,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.conversation.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.agent.count(),
      this.prisma.agent.count({
        where: { isOnline: true },
      }),
      this.prisma.conversation.aggregate({
        _avg: { responseTime: true },
      }),
    ]);

    return {
      totalUsers,
      activeConversations,
      totalAgents,
      activeAgents,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueuedConversations() {
    return this.prisma.conversationQueue.findMany({
      include: {
        conversation: {
          include: {
            user: {
              select: { selected_language: true, selected_state: true },
            },
          },
        },
      },
      where: { status: 'WAITING' },
      orderBy: [{ priority: 'desc' }, { queuedAt: 'asc' }],
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
    const mapping = {
      VERY_SATISFIED: 5,
      SATISFIED: 4,
      NEUTRAL: 3,
      DISSATISFIED: 2,
      VERY_DISSATISFIED: 1,
    };
    return mapping[satisfaction] || 3;
  }
}
