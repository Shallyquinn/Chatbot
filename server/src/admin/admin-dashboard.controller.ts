import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AdminConfigService } from './services/admin-config.service';
import { AgentEscalationService } from './services/agent-escalation.service';
import { WebSocketService } from '../services/websocket.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConversationStatus,
  AgentStatus,
  AssignmentStatus,
} from '@prisma/client';
// Note: Uncomment when implementing auth
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
// @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when auth is implemented
export class AdminDashboardController {
  constructor(
    private adminConfigService: AdminConfigService,
    private agentEscalationService: AgentEscalationService,
    private websocketService: WebSocketService,
    private prisma: PrismaService,
  ) {}

  @Get('metrics')
  async getDashboardMetrics() {
    try {
      const [
        totalConversations,
        activeConversations,
        queuedConversations,
        totalAgents,
        onlineAgents,
        avgResponseTime,
      ] = await Promise.all([
        this.prisma.conversation.count(),
        this.prisma.conversation.count({
          where: { status: ConversationStatus.AGENT_ASSIGNED },
        }),
        this.prisma.conversation.count({
          where: { status: ConversationStatus.WAITING_FOR_AGENT },
        }),
        this.prisma.agent.count(),
        this.prisma.agent.count({
          where: { status: AgentStatus.ONLINE },
        }),
        this.getAverageResponseTime(),
      ]);

      const satisfactionData = await this.getSatisfactionMetrics();
      const conversationTrends = await this.getConversationTrends();

      return {
        overview: {
          totalConversations,
          activeConversations,
          queuedConversations,
          totalAgents,
          onlineAgents,
          avgResponseTime: `${avgResponseTime}m`,
        },
        satisfaction: satisfactionData,
        trends: conversationTrends,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new HttpException(
        'Failed to fetch dashboard metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('agents')
  async getAgents(@Query('status') status?: AgentStatus) {
    try {
      const where = status ? { status } : {};

      const agents = await this.prisma.agent.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          currentChats: true,
          maxChats: true,
          lastActiveAt: true,
        },
        orderBy: { name: 'asc' },
      });

      return agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new HttpException(
        'Failed to fetch agents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('conversations')
  async getConversations(
    @Query('status') status?: ConversationStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      const skip = (page - 1) * limit;
      const where = status ? { status } : {};

      const [conversations, total] = await Promise.all([
        this.prisma.conversation.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                user_session_id: true,
                selected_language: true,
                selected_state: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.conversation.count({ where }),
      ]);

      return {
        conversations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new HttpException(
        'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('queue')
  async getQueueStatus() {
    try {
      return await this.agentEscalationService.getQueueStatus();
    } catch (error) {
      console.error('Error fetching queue status:', error);
      throw new HttpException(
        'Failed to fetch queue status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('conversations/bulk-assign')
  async bulkAssignConversations(
    @Body()
    body: {
      assignments: Array<{
        conversationId: string;
        agentId: string;
      }>;
    },
  ) {
    try {
      return await this.agentEscalationService.bulkAssignConversations(
        body.assignments,
      );
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      throw new HttpException(
        'Failed to assign conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('agents/:id/status')
  async updateAgentStatus(
    @Param('id') agentId: string,
    @Body() body: { status: AgentStatus },
  ) {
    try {
      const agent = await this.prisma.agent.update({
        where: { id: agentId },
        data: {
          status: body.status,
          lastActiveAt: new Date(),
        },
      });

      return { success: true, agent };
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw new HttpException(
        'Failed to update agent status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('configs')
  async getConfigs(
    @Query() filters: { category?: string; language?: string; search?: string },
  ) {
    try {
      const configFilter = {
        category: filters.category as any, // TODO: Validate enum values
        language: filters.language,
        search: filters.search,
      };
      return await this.adminConfigService.getAllMessages(
        filters.language || 'en',
      );
    } catch (error) {
      console.error('Error fetching configs:', error);
      throw new HttpException(
        'Failed to fetch configurations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('configs/:key/:language')
  async updateConfig(
    @Param('key') key: string,
    @Param('language') language: string,
    @Body() body: { value: string },
  ) {
    try {
      await this.adminConfigService.updateMessage(
        key,
        body.value,
        'system',
        language || 'en',
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating config:', error);
      throw new HttpException(
        'Failed to update configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/response-times')
  async getResponseTimeAnalytics(@Query('days') days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const conversations = await this.prisma.conversation.findMany({
        where: {
          assignedAt: { gte: startDate },
          status: {
            in: [ConversationStatus.COMPLETED, ConversationStatus.RESOLVED],
          },
        },
        select: {
          assignedAt: true,
          completedAt: true,
        },
      });

      const responseTimeData = conversations
        .filter((conv) => conv.assignedAt && conv.completedAt)
        .map((conv) => {
          const responseTimeMs =
            conv.completedAt!.getTime() - conv.assignedAt!.getTime();
          const responseTimeMinutes = Math.round(responseTimeMs / (1000 * 60));

          return {
            date: conv.assignedAt!.toISOString().split('T')[0],
            responseTime: responseTimeMinutes,
          };
        });

      return responseTimeData;
    } catch (error) {
      console.error('Error fetching response time analytics:', error);
      throw new HttpException(
        'Failed to fetch analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper methods
  private async getAverageResponseTime(): Promise<number> {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          assignedAt: { not: null },
          completedAt: { not: null },
        },
        select: {
          assignedAt: true,
          completedAt: true,
        },
        take: 100, // Last 100 completed conversations
        orderBy: { completedAt: 'desc' },
      });

      if (conversations.length === 0) return 0;

      const totalTime = conversations.reduce((sum, conv) => {
        if (conv.assignedAt && conv.completedAt) {
          const timeMs = conv.completedAt.getTime() - conv.assignedAt.getTime();
          return sum + timeMs / (1000 * 60); // Convert to minutes
        }
        return sum;
      }, 0);

      return Math.round(totalTime / conversations.length);
    } catch (error) {
      console.error('Error calculating average response time:', error);
      return 0;
    }
  }

  private async getSatisfactionMetrics() {
    try {
      const satisfactionData = await this.prisma.conversation.groupBy({
        by: ['satisfaction'],
        _count: { satisfaction: true },
        where: {
          satisfaction: { not: null },
        },
      });

      const total = satisfactionData.reduce(
        (sum, item) => sum + item._count.satisfaction,
        0,
      );

      return satisfactionData.map((item) => ({
        level: item.satisfaction,
        count: item._count.satisfaction,
        percentage:
          total > 0 ? Math.round((item._count.satisfaction / total) * 100) : 0,
      }));
    } catch (error) {
      console.error('Error fetching satisfaction metrics:', error);
      return [];
    }
  }

  private async getConversationTrends() {
    try {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const conversationData = await Promise.all(
        last7Days.map(async (date) => {
          const startDate = new Date(date);
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 1);

          const count = await this.prisma.conversation.count({
            where: {
              created_at: {
                gte: startDate,
                lt: endDate,
              },
            },
          });

          return { date, count };
        }),
      );

      return conversationData;
    } catch (error) {
      console.error('Error fetching conversation trends:', error);
      return [];
    }
  }
}
