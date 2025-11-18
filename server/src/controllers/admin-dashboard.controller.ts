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
} from '@nestjs/common';
import { AdminConfigService } from '../services/admin-config.service';
import { AgentEscalationService } from '../services/agent-escalation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDashboardController {
  constructor(
    private adminConfigService: AdminConfigService,
    private agentEscalationService: AgentEscalationService,
    private prisma: PrismaService,
  ) {}

  // =============================================================================
  // DASHBOARD METRICS
  // =============================================================================

  @Get('metrics')
  async getDashboardMetrics() {
    const [
      totalUsers,
      activeUsers,
      satisfiedUsers,
      avgResponseTime,
      newUsers,
      recurringUsers,
      chatbotPerformance,
      dailyEngagement,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getSatisfiedUsers(),
      this.getAverageResponseTime(),
      this.getNewUsersData(),
      this.getRecurringUsersData(),
      this.getChatbotPerformance(),
      this.getDailyEngagement(),
    ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        satisfiedUsers,
        avgResponseTime,
      },
      charts: {
        newUsers,
        recurringUsers,
        chatbotPerformance,
        dailyEngagement,
      },
    };
  }

  private async getTotalUsers() {
    return await this.prisma.user.count();
  }

  private async getActiveUsers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await this.prisma.user.count({
      where: {
        last_active_at: {
          gte: thirtyDaysAgo,
        },
      },
    });
  }

  private async getSatisfiedUsers() {
    return await this.prisma.user.count({
      where: {
        satisfactionScore: {
          gte: 4,
        },
      },
    });
  }

  private async getAverageResponseTime() {
    // Calculate average response time based on conversation analytics
    const result = await this.prisma.conversationAnalytics.aggregate({
      _avg: {
        average_response_time_seconds: true,
      },
    });
    const avgTime = result._avg?.average_response_time_seconds;
    return avgTime ? `${Number(avgTime).toFixed(1)}s` : '0.0s';
  }

  private async getNewUsersData() {
    const data: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await this.prisma.user.count({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      data.push({
        date: startOfDay.toISOString().split('T')[0],
        count,
      });
    }
    return data;
  }

  private async getRecurringUsersData() {
    const data: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await this.prisma.user.count({
        where: {
          totalConversations: {
            gt: 1,
          },
          last_active_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      data.push({
        date: startOfDay.toISOString().split('T')[0],
        count,
      });
    }
    return data;
  }

  private async getChatbotPerformance() {
    const [resolved, escalated, pending] = await Promise.all([
      this.prisma.conversation.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.conversation.count({
        where: { status: 'AGENT_ASSIGNED' },
      }),
      this.prisma.conversation.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const total = resolved + escalated + pending || 1; // Prevent division by zero
    return {
      resolved: {
        count: resolved,
        percentage: ((resolved / total) * 100).toFixed(1),
      },
      escalated: {
        count: escalated,
        percentage: ((escalated / total) * 100).toFixed(1),
      },
      pending: {
        count: pending,
        percentage: ((pending / total) * 100).toFixed(1),
      },
    };
  }

  private async getDailyEngagement() {
    const data: Array<{ hour: number; count: number }> = [];
    const today = new Date();

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(hour, 59, 59, 999);

      const count = await this.prisma.conversation.count({
        where: {
          created_at: {
            gte: hourStart,
            lt: hourEnd,
          },
        },
      });

      data.push({
        hour,
        count,
      });
    }
    return data;
  }

  // =============================================================================
  // AGENT MANAGEMENT
  // =============================================================================

  @Get('agents')
  async getAgents(@Query('status') status?: string) {
    const where = status ? { status: status as any } : {};

    const agents = await this.prisma.agent.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Get current chat count for each agent
    const agentsWithCounts = await Promise.all(
      agents.map(async (agent) => {
        const activeChats = await this.prisma.conversation.count({
          where: {
            assignedAgentId: agent.id,
            status: 'AGENT_ASSIGNED',
          },
        });

        return {
          ...agent,
          _count: {
            assignedConversations: activeChats,
          },
        };
      }),
    );

    return agentsWithCounts;
  }

  @Post('agents')
  async createAgent(
    @Body()
    createAgentDto: {
      firstName: string;
      lastName: string;
      email: string;
      status?: string;
      maxChats?: number;
      password?: string;
    },
  ) {
    // Combine firstName and lastName into name
    const fullName =
      `${createAgentDto.firstName} ${createAgentDto.lastName}`.trim();

    return await this.prisma.agent.create({
      data: {
        name: fullName,
        email: createAgentDto.email,
        status: (createAgentDto.status as AgentStatus) || AgentStatus.OFFLINE,
        maxChats: createAgentDto.maxChats || 5,
        password: createAgentDto.password || 'Temp123!',
      },
    });
  }

  @Put('agents/:id')
  async updateAgent(
    @Param('id') id: string,
    @Body() updateAgentDto: Record<string, any>,
  ) {
    return await this.prisma.agent.update({
      where: { id: id },
      data: updateAgentDto,
    });
  }

  @Delete('agents/:id')
  async deleteAgent(@Param('id') id: string) {
    return await this.prisma.agent.delete({
      where: { id: id },
    });
  }

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  @Get('conversations/queue')
  async getConversationQueue() {
    return await this.agentEscalationService.getQueueStatus();
  }

  @Post('conversations/bulk-assign')
  async bulkAssignConversations(
    @Body()
    bulkAssignDto: {
      assignments: {
        agentId: string;
        conversationIds: string[];
      }[];
    },
  ) {
    return await this.agentEscalationService.bulkAssignConversations(
      bulkAssignDto.assignments,
    );
  }

  @Put('conversations/:id/assign')
  async assignConversation(
    @Param('id') conversationId: string,
    @Body() assignDto: { agentId: string },
  ) {
    await this.agentEscalationService.assignConversation(
      conversationId,
      assignDto.agentId,
    );

    return { success: true, message: 'Conversation assigned successfully' };
  }

  @Get('conversations')
  async getConversations(
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (agentId) where.assignedAgentId = agentId;

    const conversations = await this.prisma.conversation.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            user_session_id: true,
            selected_language: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit.toString()),
    });

    const total = await this.prisma.conversation.count({ where });

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =============================================================================
  // CONFIGURATION MANAGEMENT
  // =============================================================================

  @Get('config/messages')
  async getAllMessages(@Query('language') language = 'en') {
    return await this.adminConfigService.getAllMessages(language);
  }

  @Put('config/messages/:key')
  async updateMessage(
    @Param('key') key: string,
    @Body() updateDto: { value: string; language?: string },
    @Request() req: any,
  ) {
    await this.adminConfigService.updateMessage(
      key,
      updateDto.value,
      req.user.id, // Get admin ID from JWT token
      updateDto.language,
    );

    return { success: true, message: 'Message updated successfully' };
  }

  @Get('config/options/:key')
  async getChatbotOptions(@Param('key') key: string) {
    return await this.adminConfigService.getChatbotOptions(key);
  }

  @Put('config/options/:key')
  async updateChatbotOptions(
    @Param('key') key: string,
    @Body() updateDto: { options: string[] },
    @Request() req: any,
  ) {
    await this.adminConfigService.updateChatbotOptions(
      key,
      updateDto.options,
      req.user.id, // Get admin ID from JWT token
    );

    return { success: true, message: 'Options updated successfully' };
  }

  @Get('config/system')
  async getSystemSettings() {
    return await this.adminConfigService.getSystemSettings();
  }

  @Put('config/system/:key')
  async updateSystemSetting(
    @Param('key') key: string,
    @Body() updateDto: { value: string },
    @Request() req: any,
  ) {
    await this.adminConfigService.updateSystemSetting(
      key,
      updateDto.value,
      req.user.id, // Get admin ID from JWT token
    );

    return { success: true, message: 'System setting updated successfully' };
  }

  // =============================================================================
  // CONFIGURATION IMPORT/EXPORT
  // =============================================================================

  @Get('config/export')
  async exportConfiguration() {
    return await this.adminConfigService.exportConfiguration();
  }

  @Post('config/import')
  async importConfiguration(@Body() configData: any, @Request() req: any) {
    return await this.adminConfigService.importConfiguration(
      configData,
      req.user.id, // Get admin ID from JWT token
    );
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  @Get('analytics/conversations')
  async getConversationAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      totalConversations,
      avgSatisfactionScore,
      escalationRate,
      completionRate,
    ] = await Promise.all([
      this.prisma.conversation.count({
        where: {
          created_at: { gte: start, lte: end },
        },
      }),
      this.getAverageSatisfaction(start, end),
      this.getEscalationRate(start, end),
      this.getCompletionRate(start, end),
    ]);

    return {
      totalConversations,
      avgSatisfactionScore,
      escalationRate,
      completionRate,
    };
  }

  private async getAverageSatisfaction(start: Date, end: Date) {
    const result = await this.prisma.user.aggregate({
      where: {
        created_at: { gte: start, lte: end },
        satisfactionScore: { not: null },
      },
      _avg: { satisfactionScore: true },
    });

    return result._avg.satisfactionScore || 0;
  }

  private async getEscalationRate(start: Date, end: Date) {
    const total = await this.prisma.conversation.count({
      where: { created_at: { gte: start, lte: end } },
    });

    const escalated = await this.prisma.conversation.count({
      where: {
        created_at: { gte: start, lte: end },
        status: 'AGENT_ASSIGNED',
      },
    });

    return total > 0 ? ((escalated / total) * 100).toFixed(1) + '%' : '0%';
  }

  private async getCompletionRate(start: Date, end: Date) {
    const total = await this.prisma.conversation.count({
      where: { created_at: { gte: start, lte: end } },
    });

    const completed = await this.prisma.conversation.count({
      where: {
        created_at: { gte: start, lte: end },
        status: 'COMPLETED',
      },
    });

    return total > 0 ? ((completed / total) * 100).toFixed(1) + '%' : '0%';
  }

  // =============================================================================
  // SYSTEM HEALTH & MONITORING
  // =============================================================================

  @Get('system/health')
  async getSystemHealth() {
    const [dbHealth, activeAgents, queueLength, avgResponseTime] =
      await Promise.all([
        this.checkDatabaseHealth(),
        this.getActiveAgentsCount(),
        this.prisma.conversationQueue.count({ where: { status: 'WAITING' } }),
        this.getAverageResponseTime(),
      ]);

    return {
      database: dbHealth,
      activeAgents,
      queueLength,
      avgResponseTime,
      timestamp: new Date(),
    };
  }

  private async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  private async getActiveAgentsCount() {
    return await this.prisma.agent.count({
      where: { status: 'ONLINE' },
    });
  }
}
