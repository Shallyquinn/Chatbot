import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  // UseGuards, // TODO: Enable after creating auth guards
  // Request, // TODO: Enable after creating auth guards
} from '@nestjs/common';
import { AgentAssignmentService } from './agent-assignment.service';
// TODO: Create these auth guards
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('agent-assignment')
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Enable after creating auth guards
export class AgentAssignmentController {
  constructor(
    private readonly agentAssignmentService: AgentAssignmentService,
  ) {}

  /**
   * Auto-assign a conversation using equal distribution logic
   * POST /agent-assignment/auto-assign/:conversationId
   */
  @Post('auto-assign/:conversationId')
  // @Roles('ADMIN', 'AGENT') // TODO: Enable after creating auth guards
  async autoAssign(@Param('conversationId') conversationId: string) {
    return this.agentAssignmentService.autoAssignConversation(conversationId);
  }

  /**
   * Manually assign a conversation to a specific agent
   * POST /agent-assignment/manual-assign
   * Body: { conversationId: string, agentId: string }
   */
  @Post('manual-assign')
  // @Roles('ADMIN') // TODO: Enable after creating auth guards
  async manualAssign(
    @Body()
    body: {
      conversationId: string;
      agentId: string;
      assignedBy: string;
    },
  ) {
    return this.agentAssignmentService.manualAssignConversation(
      body.conversationId,
      body.agentId,
      body.assignedBy, // For now, pass from body instead of JWT
    );
  }

  /**
   * Bulk assign multiple conversations
   * POST /agent-assignment/bulk-assign
   * Body: { conversationIds: string[], agentId?: string, assignedBy: string }
   */
  @Post('bulk-assign')
  // @Roles('ADMIN') // TODO: Enable after creating auth guards
  async bulkAssign(
    @Body()
    body: {
      conversationIds: string[];
      agentId?: string;
      assignedBy: string;
    },
  ) {
    return this.agentAssignmentService.bulkAssignConversations(
      body.conversationIds,
      body.assignedBy, // For now, pass from body instead of JWT
      body.agentId,
    );
  }

  /**
   * Get all unassigned conversation requests
   * GET /agent-assignment/requests
   */
  @Get('requests')
  // @Roles('ADMIN', 'AGENT') // TODO: Enable after creating auth guards
  async getRequests() {
    return this.agentAssignmentService.getUnassignedRequests();
  }

  /**
   * Get agent dashboard statistics
   * GET /agent-assignment/stats
   */
  @Get('stats')
  // @Roles('ADMIN') // TODO: Enable after creating auth guards
  async getDashboardStats() {
    return this.agentAssignmentService.getAgentDashboardStats();
  }
}
