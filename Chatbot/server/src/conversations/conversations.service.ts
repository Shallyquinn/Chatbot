import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationDto } from './create-conversation.dto';
import { QueryConversationDto } from './query-conversation.dto';
import { UpdateConversationDto } from './update-conversation.dto';
import { useContainer } from 'class-validator';

@Injectable()
export class ConversationsService {
    constructor(private prisma: PrismaService) {}

   async create(dto: CreateConversationDto & {user_session_id?: string}) {
    console.log('=== CREATE CONVERSATION DEBUG ===');
    console.log('Input DTO:', JSON.stringify(dto, null, 2));
    
    let session;
    
    // Try to find session by session_id first, then by user_session_id
    if (dto.session_id && dto.session_id !== undefined) {
        console.log('Looking up session by session_id:', dto.session_id);
        
        session = await this.prisma.chatSession.findUnique({
            where: { session_id: dto.session_id },
            include: { user: true },
        });
        
    } else if (dto.user_session_id && dto.user_session_id !== undefined) {
        console.log('Looking up session by user_session_id:', dto.user_session_id);
        
        session = await this.prisma.chatSession.findFirst({
            where: { user_session_id: dto.user_session_id },
            include: { user: true },
        });
        
    } else {
        console.error('Neither session_id nor user_session_id provided');
        throw new BadRequestException('Either session_id or user_session_id is required');
    }
    
    console.log('Found session:', session ? 'YES' : 'NO');
    if (session) {
        console.log('Session details:', JSON.stringify(session, null, 2));
    }
    
    if (!session) {
        const searchCriteria = dto.session_id ? `session_id: ${dto.session_id}` : `user_session_id: ${dto.user_session_id}`;
        console.error('Session not found for', searchCriteria);
        throw new BadRequestException(`Session not found for ${searchCriteria}`);
    }

    const createData = {
        session_id: session.session_id, // Use the actual session_id from database
        user_id: session.user?.user_id,
        message_text: dto.message_text,
        message_type: dto.message_type,
        message_source: dto.message_source ?? "typed",
        chat_step: dto.chat_step,
        widget_name: dto.widget_name,
        selected_option: dto.selected_option,
        message_delay_ms: dto.message_delay_ms,
        has_widget: dto.has_widget ?? false,
        widget_options: dto.widget_options ?? [],
        message_sequence_number: dto.message_sequence_number,
    };
    
    console.log('Data to create:', JSON.stringify(createData, null, 2));
    
    try {
        const result = await this.prisma.conversation.create({
            data: createData,
            include: {
                session: true,
                user: true
            },
        });
        
        console.log('Created conversation:', JSON.stringify(result, null, 2));
        console.log('=== END DEBUG ===');
        
        return result;
        
    } catch (error) {
        console.error('Prisma create error:', error);
        console.log('=== END DEBUG (ERROR) ===');
        
        if (error.code === 'P2003') {
            throw new BadRequestException('Invalid session_id or user_id provided');
        }
        throw error;
    }
}
    async findAll(query: QueryConversationDto) {
        const {page = 1, limit = 20, session_id, user_session_id, message_type, chat_step} = query;
        const skip = (page - 1 ) * limit;

        const where: any = {};

        if (session_id) {
            where.session_id = session_id;
        }

        if (user_session_id) {
            where.user = {
                user_session_id: user_session_id,
            };
        }

        if(message_type) {
            where.message_type = message_type;
        }

        if (chat_step) {
            where.chat_step = chat_step;
        }

        const [conversations, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    message_sequence_number: 'asc'
                },
                include: {
                    session: {
                        select:{
                            session_id: true,
                            user_session_id:true,
                            session_start_time: true,
                        },
                    },
                    user: {
                        select: {
                            user_id: true,
                            user_session_id: true,
                            current_step: true,
                        },
                    },
                    user_responses:{
                        select: {
                            response_id: true,
                            user_response: true,
                            response_category: true,
                        },
                    },
                },
            }),
            this.prisma.conversation.count({where})
        ]);
         return {
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    }


   async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: id },
      include: {
        session: true,
        user: true,
        user_responses: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async update(id: string, dto: UpdateConversationDto) {
    try {
      const conversation = await this.prisma.conversation.update({
        where: { conversation_id: id },
        data: dto,
        include: {
          session: true,
          user: true,
        },
      });
      return conversation;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.conversation.delete({
        where: { conversation_id: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
      throw error;
    }
  }
  // Getting Conversation thread for a session
  async getSessionConversations(sessionId: string) {
    return this.prisma.conversation.findMany({
      where: { session_id: sessionId },
      orderBy: { message_sequence_number: 'asc' },
      include: {
        user_responses: {
          select: {
            response_id: true,
            user_response: true,
            response_category: true,
            step_in_flow: true,
          },
        },
      },
    });
  }

    // Users's conversation history across all sessions
  async getUserConversationHistory(userSessionId: string, limit = 100) {
    return this.prisma.conversation.findMany({
      where: {
        user: {
          user_session_id: userSessionId,
        },
      },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        session: {
          select: {
            session_id: true,
            session_start_time: true,
          },
        },
      },
    });
  }

    async getConversationsByStep(sessionId: string, chatStep: string) {
    return this.prisma.conversation.findMany({
      where: {
        session_id: sessionId,
        chat_step: chatStep,
      },
      orderBy: { message_sequence_number: 'asc' },
    });
  }

    // Latest conversation in a session
    async getLatestConversation(sessionId: string) {
    return this.prisma.conversation.findFirst({
      where: { session_id: sessionId },
      orderBy: { message_sequence_number: 'desc' },
      include: {
        user: {
          select: {
            current_step: true,
            current_fpm_method: true,
          },
        },
      },
    });
  }
}
