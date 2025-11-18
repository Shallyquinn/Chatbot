import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatSessionDto } from './dto/create-session.dto';
import { UpdateChatSessionDto } from './dto/update-chat-session.dto';
import { CreateChatStateSessionDto } from './dto/create-chat-state-session.dto';
import { UpdateChatStateSessionDto } from './dto/update-chat-state-session.dto';

@Injectable()
export class ChatSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChatSessionDto) {
    let userId = dto.user_id ?? null;

    // Only try to find user if user_session_id is provided
    if (!userId && dto.user_session_id) {
      const user = await this.prisma.user.findUnique({
        where: { user_session_id: dto.user_session_id },
        select: { user_id: true },
      });
      if (user) {
        userId = user.user_id;
      }
    } else if (userId) {
      // Validate user_id if provided
      const exists = await this.prisma.user.findUnique({
        where: { user_id: userId },
        select: { user_id: true },
      });
      if (!exists) {
        throw new BadRequestException('Invalid user_id provided');
      }
    }

    return this.prisma.chatSession.create({
      data: {
        user_session_id: dto.user_session_id ?? null,
        user_id: userId,
        session_start_time: dto.session_start_time ?? new Date().toISOString(),
        session_end_time: dto.session_end_time ?? null,
        total_messages_count: dto.total_messages_count ?? 0,
        session_duration_minutes: dto.session_duration_minutes ?? null,
        session_completed: dto.session_completed ?? false,
        session_outcome: dto.session_outcome ?? null,
        final_step_reached: dto.final_step_reached ?? null,
        user_agent: dto.user_agent ?? null,
        ip_address: dto.ip_address ?? null,
        device_type: dto.device_type ?? null,
      },
      include: { user: true },
    });
  }

  async updateByUserSessionId(
    userSessionId: string,
    dto: UpdateChatSessionDto,
  ) {
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
      throw new NotFoundException(
        `Chat session with id ${sessionId} not found`,
      );
    }

    return session;
  }

  async getAll() {
    return this.prisma.chatSession.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // ============================================================================
  // CHAT STATE SESSION METHODS (for frontend session persistence)
  // ============================================================================

  async createChatStateSession(dto: CreateChatStateSessionDto) {
    const existingSession = await this.prisma.chatStateSession.findUnique({
      where: { user_session_id: dto.user_session_id },
    });

    if (existingSession) {
      // Update existing session
      return this.updateChatStateSession(dto.user_session_id, {
        chat_state: dto.chat_state,
        last_activity: dto.last_activity,
      });
    }

    // Create new session
    return this.prisma.chatStateSession.create({
      data: {
        user_session_id: dto.user_session_id,
        chat_state: dto.chat_state,
        last_activity: dto.last_activity
          ? new Date(dto.last_activity)
          : new Date(),
      },
    });
  }

  async getChatStateSession(userSessionId: string) {
    const session = await this.prisma.chatStateSession.findUnique({
      where: { user_session_id: userSessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Chat state session for user_session_id ${userSessionId} not found`,
      );
    }

    return {
      chat_state: session.chat_state,
      last_activity: session.last_activity.toISOString(),
    };
  }

  async updateChatStateSession(
    userSessionId: string,
    dto: UpdateChatStateSessionDto,
  ) {
    const updateData: {
      chat_state?: string;
      last_activity?: Date;
    } = {};

    if (dto.chat_state) {
      updateData.chat_state = dto.chat_state;
    }

    if (dto.last_activity) {
      updateData.last_activity = new Date(dto.last_activity);
    } else {
      updateData.last_activity = new Date();
    }

    const session = await this.prisma.chatStateSession.update({
      where: { user_session_id: userSessionId },
      data: updateData,
    });

    return {
      chat_state: session.chat_state,
      last_activity: session.last_activity.toISOString(),
    };
  }

  async deleteChatStateSession(userSessionId: string) {
    await this.prisma.chatStateSession.delete({
      where: { user_session_id: userSessionId },
    });

    return { message: 'Chat state session deleted successfully' };
  }
}
