import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import type {
  ConfigUpdateDto,
  CreateAgentDto,
  UpdateAgentDto,
  AssignConversationDto,
  BulkAssignConversationsDto,
  UpdateAdminProfileDto,
  BulkAgentDto,
} from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('config')
  async getAllConfigs() {
    return this.adminService.getAllConfigs();
  }

  @Get('config/:category')
  async getConfigsByCategory(@Param('category') category: string) {
    return this.adminService.getConfigsByCategory(category);
  }

  @Post('config')
  async updateConfig(@Body() configDto: ConfigUpdateDto, @Request() req: any) {
    return this.adminService.updateConfig(configDto, req.user.id);
  }

  @Get('agents')
  async getAllAgents() {
    return this.adminService.getAllAgents();
  }

  @Get('agents/:id')
  async getAgentById(@Param('id') agentId: string) {
    return this.adminService.getAgentById(agentId);
  }

  @Post('agents')
  async createAgent(@Body() createAgentDto: CreateAgentDto) {
    return this.adminService.createAgent(createAgentDto);
  }

  @Post('agents/bulk-upload')
  async bulkCreateAgents(@Body() body: { agents: BulkAgentDto[] }) {
    return this.adminService.bulkCreateAgents(body.agents);
  }

  @Put('agents/:id')
  async updateAgent(
    @Param('id') agentId: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.adminService.updateAgent(agentId, updateAgentDto);
  }

  @Delete('agents/:id')
  async deleteAgent(@Param('id') agentId: string) {
    return this.adminService.deleteAgent(agentId);
  }

  @Post('conversations/assign')
  async assignConversation(@Body() assignDto: AssignConversationDto) {
    return this.adminService.reassignConversation(assignDto);
  }

  @Post('conversations/bulk-assign')
  async bulkAssignConversations(
    @Body() bulkAssignDto: BulkAssignConversationsDto,
  ) {
    return this.adminService.bulkAssignConversations(bulkAssignDto);
  }

  @Post('conversations/auto-assign')
  async autoAssignQueuedConversations() {
    return this.adminService.autoAssignQueuedConversations();
  }

  @Get('agents/dummy')
  async getDummyAgent() {
    return this.adminService.getDummyAgent();
  }

  @Get('queue')
  async getQueuedConversations() {
    return this.adminService.getQueuedConversations();
  }

  @Get('analytics')
  async getAnalytics(@Query('days') days?: string) {
    const analyticsDays = days ? parseInt(days) : 7;
    return this.adminService.getConversationAnalytics(analyticsDays);
  }

  @Get('profile')
  async getAdminProfile(@Request() req: any) {
    return this.adminService.getAdminProfile(req.user.id);
  }

  @Put('profile')
  async updateAdminProfile(
    @Request() req: any,
    @Body() updateDto: UpdateAdminProfileDto,
  ) {
    return this.adminService.updateAdminProfile(req.user.id, updateDto);
  }
}
