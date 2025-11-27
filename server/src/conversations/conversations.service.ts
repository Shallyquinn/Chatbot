import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketService } from '../services/websocket.service';
import { EmailService } from '../services/email.service';
import { CreateConversationDto } from './create-conversation.dto';
import { QueryConversationDto } from './query-conversation.dto';
import { UpdateConversationDto } from './update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private prisma: PrismaService,
    private websocketService: WebSocketService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateConversationDto) {
    // Validate required fields
    if (!dto.session_id || !dto.user_id) {
      throw new BadRequestException(
        'session_id and user_id are required fields',
      );
    }

    try {
      return await this.prisma.conversation.create({
        data: {
          session_id: dto.session_id,
          user_id: dto.user_id,
          message_text: dto.message_text,
          message_type: dto.message_type,
          message_source: dto.message_source ?? 'typed',
          chat_step: dto.chat_step,
          widget_name: dto.widget_name,
          selected_option: dto.selected_option,
          message_delay_ms: dto.message_delay_ms,
          has_widget: dto.has_widget ?? false,
          widget_options: dto.widget_options ?? [],
          message_sequence_number: dto.message_sequence_number,
        },
        include: {
          session: true,

          user: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid session_id or user_id provided');
      }
      throw error;
    }
  }

  async findAll(query: QueryConversationDto) {
    const {
      page = 1,
      limit = 20,
      session_id,
      user_session_id,
      message_type,
      chat_step,
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

    if (message_type) {
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
          message_sequence_number: 'asc',
        },
        include: {
          session: {
            select: {
              session_id: true,
              user_session_id: true,
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
          user_responses: {
            select: {
              response_id: true,
              user_response: true,
              response_category: true,
            },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
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

  // Escalate conversation to human agent
  async escalateToHuman(conversationId: string, userId: string) {
    try {
      console.log('🔍 escalateToHuman called with:', {
        conversationId,
        userId,
      });

      // Validate inputs
      if (!conversationId || !userId) {
        console.error('❌ Missing required parameters:', {
          conversationId,
          userId,
        });
        throw new Error('conversationId and userId are required');
      }

      // Check business hours and online agents (with fallback)
      let businessHoursCheck;
      try {
        businessHoursCheck = await this.checkBusinessHoursAndAgents();
      } catch (error) {
        console.warn('⚠️ Error checking business hours, assuming available:', error);
        businessHoursCheck = {
          isWithinHours: true,
          hasOnlineAgents: false,
          message: 'Agents may be available',
          businessHours: { start: '09:00', end: '17:00', timezone: 'UTC' },
        };
      }

      if (
        !businessHoursCheck.isWithinHours ||
        !businessHoursCheck.hasOnlineAgents
      ) {
        console.log('⏰ Outside business hours or no online agents');

        // Update conversation to show it was escalated but not assigned
        await this.prisma.conversation.update({
          where: { conversation_id: conversationId },
          data: {
            status: 'WAITING_FOR_AGENT',
            escalatedAt: new Date(),
            escalationReason: businessHoursCheck.isWithinHours
              ? 'No agents available'
              : 'Outside business hours',
          },
        });

        return {
          status: 'OUTSIDE_HOURS',
          message: businessHoursCheck.message,
          isWithinHours: businessHoursCheck.isWithinHours,
          hasOnlineAgents: businessHoursCheck.hasOnlineAgents,
          businessHours: businessHoursCheck.businessHours,
        };
      }

      // First, verify the conversation exists
      const conversation = await this.prisma.conversation.findUnique({
        where: { conversation_id: conversationId },
      });

      if (!conversation) {
        console.error('❌ Conversation not found:', conversationId);
        throw new Error(`Conversation ${conversationId} not found`);
      }

      console.log('✅ Conversation found:', {
        id: conversation.conversation_id,
        userId: conversation.user_id,
        status: conversation.status,
        createdAt: conversation.created_at,
      });

      // Find an available agent (where currentChats < maxChats)
      // Note: Prisma doesn't support field-to-field comparison in where clauses,
      // so we need to fetch agents and filter in memory
      const agents = await this.prisma.agent.findMany({
        where: {
          isOnline: true,
        },
        select: {
          id: true,
          name: true,
          maxChats: true,
          currentChats: true,
        },
        orderBy: {
          currentChats: 'asc', // Sort by least chats
        },
      });

      console.log(
        `📊 Found ${agents.length} online agents:`,
        agents.map((a) => ({
          name: a.name,
          currentChats: a.currentChats,
          maxChats: a.maxChats,
          hasCapacity: a.currentChats < a.maxChats,
        })),
      );

      // Find first agent with available capacity
      const availableAgent = agents.find(
        (agent) => agent.currentChats < agent.maxChats,
      );

      if (availableAgent) {
        console.log('✅ Assigning to agent:', availableAgent.name);
        // Assign directly to available agent
        await this.prisma.$transaction([
          // Create assignment
          this.prisma.conversationAssignment.create({
            data: {
              conversationId,
              agentId: availableAgent.id,
              status: 'ACTIVE',
              priority: 'NORMAL',
            },
          }),
          // Update agent's current chat count
          this.prisma.agent.update({
            where: { id: availableAgent.id },
            data: {
              currentChats: {
                increment: 1,
              },
            },
          }),
          // Update conversation status
          this.prisma.conversation.update({
            where: { conversation_id: conversationId },
            data: {
              status: 'AGENT_ASSIGNED',
              assignedAgentId: availableAgent.id,
              assignedAt: new Date(),
              escalatedAt: new Date(),
              escalationReason: 'User requested human agent',
            },
          }),
        ]);

        console.log('✅ Transaction completed - assignment created');

        // Notify agent about new assignment via WebSocket
        try {
          if (this.websocketService) {
            this.websocketService.notifyAgent(availableAgent.id, {
              type: 'NEW_CONVERSATION_ASSIGNED',
              conversationId,
              userId,
              userName: `User ${userId.slice(0, 8)}`,
              priority: 'NORMAL',
              timestamp: new Date(),
            });
          }
        } catch (err) {
          console.error('Failed to notify agent via WebSocket:', err);
        }

        // Notify admins about assignment
        try {
          if (this.websocketService) {
            this.websocketService.notifyAdmins({
              type: 'CONVERSATION_ASSIGNED',
              conversationId,
              agentId: availableAgent.id,
              agentName: availableAgent.name,
              timestamp: new Date(),
            });
          }
        } catch (err) {
          console.error('Failed to notify admins via WebSocket:', err);
        }

        // Send email notification to agent
        const agent = await this.prisma.agent.findUnique({
          where: { id: availableAgent.id },
          select: { email: true, name: true },
        });

        if (agent?.email) {
          await this.emailService
            .sendAssignmentNotification(
              agent.email,
              agent.name,
              conversationId,
              `User ${userId.slice(0, 8)}`,
              'AUTOMATIC',
            )
            .catch((err) =>
              console.error('Failed to send assignment email:', err),
            );
        }

        return {
          status: 'ASSIGNED',
          agentId: availableAgent.id,
          agentName: availableAgent.name,
        };
      } else {
        console.log('⚠️ No available agents - adding to queue');

        // No available agents, add to queue
        const queueEntry = await this.prisma.conversationQueue.create({
          data: {
            conversationId,
            userId,
            priority: 'NORMAL',
            status: 'WAITING',
            estimatedWait: 15, // 15 minutes estimate
          },
        });

        // Update conversation status
        await this.prisma.conversation.update({
          where: { conversation_id: conversationId },
          data: {
            status: 'WAITING_FOR_AGENT',
            escalatedAt: new Date(),
            escalationReason: 'User requested human agent',
          },
        });

        // Calculate queue position
        const position = await this.prisma.conversationQueue.count({
          where: {
            status: 'WAITING',
            queuedAt: {
              lte: queueEntry.queuedAt,
            },
          },
        });

        // Notify admins about new queue entry
        try {
          if (this.websocketService) {
            this.websocketService.notifyAdmins({
              type: 'NEW_QUEUE_ENTRY',
              conversationId,
              userId,
              position,
              timestamp: new Date(),
            });
          }
        } catch (err) {
          console.error('Failed to notify admins about queue entry:', err);
        }

        // Send queue overflow warning email if queue size exceeds threshold
        if (position > 10) {
          const adminEmail =
            process.env.ADMIN_EMAIL || 'admin@honeychatbot.com';
          await this.emailService
            .sendQueueOverflowWarning(adminEmail, position, 10)
            .catch((err) =>
              console.error('Failed to send queue overflow email:', err),
            );
        }

        return {
          status: 'QUEUED',
          position,
          estimatedWaitTime: `${queueEntry.estimatedWait} minutes`,
        };
      }
    } catch (error) {
      console.error('❌ Error in escalateToHuman:', error);
      throw error;
    }
  }

  /**
   * Check if current time is within business hours and if any agents are online
   */
  private async checkBusinessHoursAndAgents() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTimeInMinutes = hour * 60 + minute;

    // Business hours: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM
    const businessHours = {
      weekday: { start: 8 * 60, end: 18 * 60 }, // 8 AM - 6 PM
      saturday: { start: 9 * 60, end: 14 * 60 }, // 9 AM - 2 PM
      sunday: null, // Closed
    };

    let isWithinHours = false;
    let businessHoursMessage = '';

    if (dayOfWeek === 0) {
      // Sunday - Closed
      businessHoursMessage =
        'Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM';
    } else if (dayOfWeek === 6) {
      // Saturday
      isWithinHours =
        currentTimeInMinutes >= businessHours.saturday.start &&
        currentTimeInMinutes < businessHours.saturday.end;
      businessHoursMessage = 'Saturday 9:00 AM - 2:00 PM';
    } else {
      // Monday-Friday
      isWithinHours =
        currentTimeInMinutes >= businessHours.weekday.start &&
        currentTimeInMinutes < businessHours.weekday.end;
      businessHoursMessage = 'Monday-Friday 8:00 AM - 6:00 PM';
    }

    // Check if any agents are online
    const onlineAgentsCount = await this.prisma.agent.count({
      where: { isOnline: true },
    });

    const hasOnlineAgents = onlineAgentsCount > 0;

    let message = '';
    if (!isWithinHours) {
      message = `Our human agents are currently unavailable. We operate during ${businessHoursMessage}. You can continue chatting with our AI assistant or come back during business hours.`;
    } else if (!hasOnlineAgents) {
      message = `All our agents are currently offline. You can continue chatting with our AI assistant or try again later during business hours (${businessHoursMessage}).`;
    }

    return {
      isWithinHours,
      hasOnlineAgents,
      businessHours: businessHoursMessage,
      message,
    };
  }

  // Get queue status for a conversation
  async getQueueStatus(conversationId: string) {
    const queueEntry = await this.prisma.conversationQueue.findFirst({
      where: {
        conversationId,
        status: 'WAITING',
      },
    });

    if (!queueEntry) {
      return { status: 'NOT_IN_QUEUE' };
    }

    const position = await this.prisma.conversationQueue.count({
      where: {
        status: 'WAITING',
        queuedAt: {
          lte: queueEntry.queuedAt,
        },
      },
    });

    return {
      status: 'QUEUED',
      position,
      estimatedWaitTime: `${queueEntry.estimatedWait} minutes`,
      queuedAt: queueEntry.queuedAt,
    };
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId: string, limit = 100) {
    const responses = await this.prisma.agentMessage.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        sentAt: 'asc',
      },
      take: limit,
    });

    return responses.map((response) => ({
      id: response.id,
      conversationId: response.conversationId,
      text: response.messageText,
      content: response.messageText,
      sender: 'agent',
      senderType: 'AGENT',
      timestamp: response.sentAt,
      createdAt: response.sentAt,
      agentId: response.agentId,
      isRead: response.isRead,
    }));
  }

  // Handle queue timeout (30 minutes)
  async handleQueueTimeout(
    conversationId: string,
    queueDuration: number,
    userId: string,
  ) {
    console.log('⏰ Queue timeout handler called:', {
      conversationId,
      queueDuration,
      userId,
    });

    // Update conversation status
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        status: 'ABANDONED',
        escalationReason: `Queue timeout after ${queueDuration / 60000} minutes`,
      },
    });

    // Update queue entry status
    await this.prisma.conversationQueue.updateMany({
      where: {
        conversationId,
        status: 'WAITING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Get queue position for admin notification
    const queueEntry = await this.prisma.conversationQueue.findFirst({
      where: { conversationId },
      select: { queuedAt: true },
    });

    const position = queueEntry
      ? await this.prisma.conversationQueue.count({
          where: {
            queuedAt: { lte: queueEntry.queuedAt },
            status: { in: ['WAITING', 'CANCELLED'] },
          },
        })
      : 0;

    // Notify admins via WebSocket
    this.websocketService.notifyAdmins({
      type: 'QUEUE_TIMEOUT',
      conversationId,
      userId,
      queueDuration,
      position,
      timestamp: new Date(),
    });

    // Send escalation alert email to admins
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@honeychatbot.com';
    await this.emailService
      .sendEscalationAlert(
        adminEmail,
        conversationId,
        `User ${userId.slice(0, 8)}`,
        'Queue System',
        `Queue timeout after ${queueDuration / 60000} minutes (position: ${position})`,
      )
      .catch((err) =>
        console.error('Failed to send queue timeout email:', err),
      );

    return {
      status: 'TIMEOUT',
      message: 'Queue timeout recorded and admins notified',
      conversationId,
      queueDuration,
    };
  }
}
