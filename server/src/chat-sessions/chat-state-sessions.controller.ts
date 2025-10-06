import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateChatStateSessionDto } from './dto/create-chat-state-session.dto';
import { UpdateChatStateSessionDto } from './dto/update-chat-state-session.dto';
import { ChatSessionsService } from './chat-sessions.service';

@Controller('chat-state-sessions')
export class ChatStateSessionsController {
  constructor(private readonly service: ChatSessionsService) {}

  @Post()
  async create(@Body() dto: CreateChatStateSessionDto) {
    return this.service.createChatStateSession(dto);
  }

  @Get(':userSessionId')
  async get(@Param('userSessionId') userSessionId: string) {
    return this.service.getChatStateSession(userSessionId);
  }

  @Put(':userSessionId')
  async update(
    @Param('userSessionId') userSessionId: string,
    @Body() dto: UpdateChatStateSessionDto,
  ) {
    return this.service.updateChatStateSession(userSessionId, dto);
  }

  @Delete(':userSessionId')
  async delete(@Param('userSessionId') userSessionId: string) {
    return this.service.deleteChatStateSession(userSessionId);
  }
}
