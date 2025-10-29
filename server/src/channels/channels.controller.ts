import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto, UpdateChannelDto, AssignAgentDto } from './dto';

@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  // Get all channels
  @Get()
  async getAllChannels(
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ) {
    return this.channelsService.findAll(includeInactive);
  }

  // Get channel by ID
  @Get(':id')
  async getChannel(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  // Get channel metrics
  @Get(':id/metrics')
  async getChannelMetrics(
    @Param('id') id: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.channelsService.getMetrics(id, days);
  }

  // Get channel conversations
  @Get(':id/conversations')
  async getChannelConversations(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.channelsService.getConversations(id, { status, page, limit });
  }

  // Create new channel (Admin only)
  @Post()
  async createChannel(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(createChannelDto);
  }

  // Update channel (Admin only)
  @Put(':id')
  async updateChannel(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.update(id, updateChannelDto);
  }

  // Delete channel (Admin only)
  @Delete(':id')
  async deleteChannel(@Param('id') id: string) {
    return this.channelsService.delete(id);
  }

  // Assign agent to channel
  @Post(':id/agents')
  async assignAgent(
    @Param('id') channelId: string,
    @Body() assignAgentDto: AssignAgentDto,
  ) {
    return this.channelsService.assignAgent(channelId, assignAgentDto);
  }

  // Remove agent from channel
  @Delete(':id/agents/:agentId')
  async removeAgent(
    @Param('id') channelId: string,
    @Param('agentId') agentId: string,
  ) {
    return this.channelsService.removeAgent(channelId, agentId);
  }

  // Get agents assigned to channel
  @Get(':id/agents')
  async getChannelAgents(@Param('id') channelId: string) {
    return this.channelsService.getAssignedAgents(channelId);
  }

  // Toggle channel active status
  @Put(':id/toggle')
  async toggleChannel(@Param('id') id: string) {
    return this.channelsService.toggleActive(id);
  }
}
