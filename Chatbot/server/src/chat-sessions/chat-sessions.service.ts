import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatSessionDto } from './create-session.dto';
import { UpdateChatSessionDto } from './update-chat-session.dto';

@Injectable()
export class ChatSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChatSessionDto) {
    let userId = dto.user_id ?? null;

    if (!userId) {
      const user = await this.prisma.user.findUnique({
      where: {user_session_id: dto.user_session_id},
      select: {user_id: true},
    });
    if (!user) {
      throw new BadRequestException("User not for this session_id");

    }
    userId = user?.user_id ?? null;
    } else {
       const exists = await this.prisma.user.findUnique({
        where: { user_id: userId },
        select: { user_id: true },
      });
      if (!exists) {
        throw new BadRequestException('Invalid user_id provided');
      }
    }
    
    return this.prisma.chatSession.create({ data:{
      user_session_id: dto.user_session_id,
          user_id: userId, // <- now guaranteed (or explicitly null if you choose)
          session_start_time:
            dto.session_start_time ?? new Date().toISOString(),
          session_end_time: dto.session_end_time ?? null,
          total_messages_count: dto.total_messages_count ?? 0,
          session_duration_minutes:
            dto.session_duration_minutes ?? null,
          session_completed: dto.session_completed ?? false,
          session_outcome: dto.session_outcome ?? null,
          final_step_reached: dto.final_step_reached ?? null,
          user_agent: dto.user_agent ?? null,
          ip_address: dto.ip_address ?? null,
          device_type: dto.device_type ?? null,
    },
    include: {user: true}
  });
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
