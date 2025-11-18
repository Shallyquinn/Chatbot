import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { EmailService } from '../services/email.service';
import { WebSocketService } from '../services/websocket.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, EmailService, WebSocketService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
