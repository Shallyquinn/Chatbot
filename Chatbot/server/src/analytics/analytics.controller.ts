import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateConversationAnalyticsDto } from './create-conversation-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}


  @Post()
  async upsertAnalytics(@Body() dto: CreateConversationAnalyticsDto) {
    return this.analyticsService.upsertAnalytics(dto);
  }

  
  @Get(':sessionId')
  async getAnalyticsBySession(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getAnalyticsBySession(sessionId);
  }

  
  @Get('stats')
  async getStats() {
    return this.analyticsService.getStats();
  }

  
  @Get('flows')
  async getFlows() {
    return this.analyticsService.getFlows();
  }
}
