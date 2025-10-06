import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChatSessionsModule } from './chat-sessions/chat-sessions.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ResponsesModule } from './responses/responses.module';
import { FpmInteractionsModule } from './fpm-interactions/fpm-interactions.module';
import { ReferralsModule } from './referrals/referrals.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicLocationModule } from './clinic-location/clinic-location.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AgentsModule } from './agents/agents.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UserModule,
    ChatSessionsModule,
    ConversationsModule,
    ResponsesModule,
    FpmInteractionsModule,
    ReferralsModule,
    AnalyticsModule,
    PrismaModule,
    ClinicLocationModule,
    AuthModule,
    AdminModule,
    AgentsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
