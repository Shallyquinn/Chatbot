import { Module } from '@nestjs/common';
import { ChatSessionsController } from './chat-sessions.controller';
import { ChatStateSessionsController } from './chat-state-sessions.controller';
import { ChatSessionsService } from './chat-sessions.service';

@Module({
  controllers: [ChatSessionsController, ChatStateSessionsController],
  providers: [ChatSessionsService],
})
export class ChatSessionsModule {}
