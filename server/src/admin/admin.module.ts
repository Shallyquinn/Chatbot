import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AgentEscalationService } from './services/agent-escalation.service';
import { AdminConfigService } from './services/admin-config.service';
import { WebSocketService } from '../services/websocket.service';
import { AgentController } from '../controllers/agent.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AdminService,
    AgentEscalationService,
    AdminConfigService,
    WebSocketService,
  ],
  controllers: [AdminController, AdminDashboardController, AgentController],
  exports: [
    AdminService,
    AgentEscalationService,
    AdminConfigService,
    WebSocketService,
  ],
})
export class AdminModule {}
