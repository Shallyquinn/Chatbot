import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import type { AgentLoginDto } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('login')
  async login(@Body() loginDto: AgentLoginDto) {
    return this.agentsService.agentLogin(loginDto);
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id') agentId: string) {
    return this.agentsService.getAgentDashboard(agentId);
  }

  @Get(':id/conversations/assigned')
  async getAssignedConversations(@Param('id') agentId: string) {
    return this.agentsService.getAssignedConversations(agentId);
  }

  @Get(':id/conversations/queued')
  async getQueuedConversations(@Param('id') agentId: string) {
    return this.agentsService.getQueuedConversations(agentId);
  }

  @Post(':agentId/conversations/:conversationId/assign')
  async assignConversation(
    @Param('agentId') agentId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.agentsService.assignConversation(agentId, conversationId);
  }

  @Post(':agentId/conversations/:conversationId/message')
  async sendMessage(
    @Param('agentId') agentId: string,
    @Param('conversationId') conversationId: string,
    @Body() messageDto: { content: string },
  ) {
    return this.agentsService.sendMessage(
      agentId,
      conversationId,
      messageDto.content,
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') agentId: string,
    @Body() statusDto: { isOnline: boolean },
  ) {
    return this.agentsService.updateAgentStatus(agentId, statusDto.isOnline);
  }

  @Get('availability')
  async getAvailability() {
    return this.agentsService.getAgentAvailability();
  }
}
