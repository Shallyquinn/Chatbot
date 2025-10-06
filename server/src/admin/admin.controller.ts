import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import type { ConfigUpdateDto } from './admin.service';

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

  @Get('queue')
  async getQueuedConversations() {
    return this.adminService.getQueuedConversations();
  }

  @Get('analytics')
  async getAnalytics(@Query('days') days?: string) {
    const analyticsDays = days ? parseInt(days) : 7;
    return this.adminService.getConversationAnalytics(analyticsDays);
  }
}
