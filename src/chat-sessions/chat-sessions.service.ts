import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatSessionDto } from './create-session.dto';
import { UpdateChatSessionDto } from './update-chat-session.dto';

@Injectable()
export class ChatSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChatSessionDto) {
    return this.prisma.chatSession.create({ data: dto });
  }

  async updateByUserSessionId(userSessionId: string, dto: UpdateChatSessionDto) {
    const result = await this.prisma.chatSession.updateMany({
      where: { user_session_id: userSessionId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `No chat session found for user_session_id ${userSessionId}`,
      );
    }

    return { updated: result.count };
  }

  async listForUser(userSessionId: string) {
    return this.prisma.chatSession.findMany({
      where: { user_session_id: userSessionId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getOne(sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Chat session with id ${sessionId} not found`);
    }

    return session;
  }

  async getAll() {
    return this.prisma.chatSession.findMany({
      orderBy: { created_at: 'desc' },
    });
  }
}
