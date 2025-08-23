import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResponseDto } from './create-response.dto';
import { QueryResponseDto } from './query-response.dto';
import { UpdateResponseDto } from './update-response.dto';

@Injectable()
export class ResponsesService {
    constructor(private prisma: PrismaService) {}

    create(dto: CreateResponseDto) {
        return this.prisma.userResponse.create({data: dto});
    }

    list(sessionId: string) {
        return this.prisma.userResponse.findMany({where: {session_id: sessionId},
         orderBy: { created_at: 'asc' },
        })
       
    }

    async findAll(query: QueryResponseDto) {
        const {
            page = 1,
            limit = 50,
            session_id,
            user_session_id,
            conversation_id,
            response_category,
            response_type,
            step_in_flow,
            is_initial_response,
            sort_by = 'created_at',
            sort_order = 'desc',
        
        } = query;
        const skip = (page - 1) * limit;
        const where: any = {};

         if (session_id) {
      where.session_id = session_id;
    }

    if (user_session_id) {
      where.user = {
        user_session_id: user_session_id,
      };
    }

    if (conversation_id) {
      where.conversation_id = conversation_id;
    }

    if (response_category) {
      where.response_category = response_category;
    }

    if (response_type) {
      where.response_type = response_type;
    }

    if (step_in_flow) {
      where.step_in_flow = step_in_flow;
    }

    if (is_initial_response !== undefined) {
      where.is_initial_response = is_initial_response;
    }

   const orderBy: any = {
    [sort_by]: sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc',
  };
    const [responses, total] = await Promise.all([
        this.prisma.userResponse.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include:{
                user:{
                    select: {
                        user_id: true,
                        user_session_id: true,
                        current_step: true,
                        selected_language: true,
                    },
                },
                session: {
                    select: {
                        session_id:true,
                        user_session_id: true,
                        session_start_time: true,
                    },
                },
                conversation: {
                    select: {
                        conversation_id:true,
                        message_text:true,
                        chat_step:true,
                    },
                },
                previous_response: {
                    select: {
                        response_id: true,
                        user_response: true,
                        step_in_flow: true,
                    },
                },
            },
        }),
        this.prisma.userResponse.count({where}),
    ]);
    return {
        data: responses,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
    };
    }

    async findOne(id: string) {
        const response = await this.prisma.userResponse.findUnique({
            where: {response_id: id},
            include: {
                user: {
                    select: {
                        user_id: true,
                        user_session_id: true,
                        current_step: true,
                        selected_language: true,
                        selected_gender: true,
                        selected_state: true,
                    },
                },
                session: true,
                conversation: true,
                previous_response: true,
                next_responses: {
                    select: {
                        response_id: true,
                        user_response: true,
                        step_in_flow: true,
                        created_at: true,
                    },
                },
            },
        });
        if (!response) {
            throw new NotFoundException(`Response with ID ${id} not found`);
        }
        return response;
    }

    async update(id: string, dto: UpdateResponseDto) {
        try {
            const response = await this.prisma.userResponse.update({
                where: {response_id: id},
                data: dto,
                include: {
                    user: {
                       select: {
                        user_id: true,
                        user_session_id: true,
                       }
                    }
                }

            });
            return response;
            
        }catch (error) {
            if (error.code === `P2025`) {
                throw new NotFoundException(`Response with ID ${id} not found`);
                
            }
            throw error;
        }
    }
      async remove(id: string) {
    try {
      return await this.prisma.userResponse.delete({
        where: { response_id: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Response with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getSessionResponse(session_id: string) {
    return this.prisma.userResponse.findMany({
        where: {session_id},
        orderBy: {created_at: 'asc'},
        include: {
            conversation: {
                select: {
                    message_text: true,
                    message_type: true,
                    chat_step: true,
                },
            },
            previous_response: {
                select: {
                    response_id: true,
                    user_response: true
                },
            },
        },
    });
  }

    async getUserResponses(userSessionId: string, limit = 100) {
    return this.prisma.userResponse.findMany({
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

  // Get conversation flow (following previous_response chain)
  async getConversationFlow(sessionId: string) {
    return this.prisma.userResponse.findMany({
      where: { session_id: sessionId },
      include: {
        previous_response: {
          select: {
            response_id: true,
            user_response: true,
            step_in_flow: true,
          },
        },
        next_responses: {
          select: {
            response_id: true,
            user_response: true,
            step_in_flow: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Get responses by category
  async getResponsesByCategory(sessionId: string, category: string) {
    return this.prisma.userResponse.findMany({
      where: {
        session_id: sessionId,
        response_category: category,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Get initial responses only
  async getInitialResponses(sessionId: string) {
    return this.prisma.userResponse.findMany({
      where: {
        session_id: sessionId,
        is_initial_response: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Get responses by step in flow
  async getResponsesByStep(sessionId: string, step: string) {
    return this.prisma.userResponse.findMany({
      where: {
        session_id: sessionId,
        step_in_flow: step,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Get latest response for a user
  async getLatestUserResponse(userSessionId: string) {
    return this.prisma.userResponse.findFirst({
      where: {
        user: {
          user_session_id: userSessionId,
        },
      },
      orderBy: { created_at: 'desc' },
      include: {
        session: {
          select: {
            session_id: true,
          },
        },
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
