import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, UpdateChannelDto, AssignAgentDto } from './dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive: boolean = false) {
    return this.prisma.channel.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            conversations: true,
            agentAssignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: {
        agentAssignments: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                isOnline: true,
              },
            },
          },
        },
        _count: {
          select: {
            conversations: true,
            channelMessages: true,
          },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Channel ${id} not found`);
    }

    return channel;
  }

  async getMetrics(channelId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.prisma.channelMetrics.findMany({
      where: {
        channelId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate aggregates
    const totalConversations = metrics.reduce(
      (sum, m) => sum + m.totalConversations,
      0,
    );
    const avgResponseTime =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + Number(m.avgResponseTime || 0), 0) /
          metrics.length
        : 0;
    const avgSatisfaction =
      metrics.length > 0
        ? metrics.reduce(
            (sum, m) => sum + Number(m.satisfactionScore || 0),
            0,
          ) / metrics.length
        : 0;

    return {
      daily: metrics,
      summary: {
        totalConversations,
        avgResponseTime: Math.round(avgResponseTime),
        avgSatisfaction: avgSatisfaction.toFixed(2),
        period: `Last ${days} days`,
      },
    };
  }

  async getConversations(channelId: string, options: any) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = { channelId };
    if (status) {
      where.status = status;
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              user_id: true,
              selected_language: true,
              selected_gender: true,
            },
          },
          assignment: {
            include: {
              agent: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(createChannelDto: CreateChannelDto) {
    return this.prisma.channel.create({
      data: createChannelDto,
    });
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    // Check if channel exists
    await this.findOne(id);

    return this.prisma.channel.update({
      where: { id },
      data: updateChannelDto,
    });
  }

  async delete(id: string) {
    // Check if channel has active conversations
    const activeConvos = await this.prisma.conversation.count({
      where: {
        channelId: id,
        status: 'ACTIVE',
      },
    });

    if (activeConvos > 0) {
      throw new BadRequestException(
        `Cannot delete channel with ${activeConvos} active conversations`,
      );
    }

    return this.prisma.channel.delete({ where: { id } });
  }

  async assignAgent(channelId: string, assignAgentDto: AssignAgentDto) {
    const { agentId, maxChats = 5, priority = 1 } = assignAgentDto;

    // Check if channel exists
    await this.findOne(channelId);

    // Check if agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException(`Agent ${agentId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.prisma.agentChannelAssignment.findUnique({
      where: {
        agentId_channelId: {
          agentId,
          channelId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Agent is already assigned to this channel',
      );
    }

    return this.prisma.agentChannelAssignment.create({
      data: {
        agentId,
        channelId,
        maxChats,
        priority,
      },
      include: {
        agent: true,
        channel: true,
      },
    });
  }

  async removeAgent(channelId: string, agentId: string) {
    const assignment = await this.prisma.agentChannelAssignment.findUnique({
      where: {
        agentId_channelId: {
          agentId,
          channelId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Agent assignment not found');
    }

    return this.prisma.agentChannelAssignment.delete({
      where: {
        agentId_channelId: {
          agentId,
          channelId,
        },
      },
    });
  }

  async getAssignedAgents(channelId: string) {
    return this.prisma.agentChannelAssignment.findMany({
      where: { channelId, isActive: true },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            isOnline: true,
            currentChats: true,
            maxChats: true,
          },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async toggleActive(id: string) {
    const channel = await this.findOne(id);
    return this.prisma.channel.update({
      where: { id },
      data: { isActive: !channel.isActive },
    });
  }
}
