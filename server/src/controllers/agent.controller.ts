import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AgentEscalationService } from '../admin/services/agent-escalation.service';
import { WebSocketService } from '../services/websocket.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentStatus, AssignmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentGuard } from '../auth/guards/agent.guard';

@Controller('agent')
@UseGuards(JwtAuthGuard, AgentGuard)
export class AgentController {
  constructor(
    private agentEscalationService: AgentEscalationService,
    private websocketService: WebSocketService,
    private prisma: PrismaService,
  ) {}

  // Helper method to get agent ID from request or throw error
  private getAgentId(req: unknown): string {
    const agentId = (req as any).user?.id;
    if (!agentId) {
      throw new UnauthorizedException(
        'Agent not authenticated. Please log in.',
      );
    }
    return agentId;
  }

  // =============================================================================
  // AGENT DASHBOARD & PROFILE
  // =============================================================================

  @Get('profile')
  async getAgentProfile(@Request() req) {
    const agentId = this.getAgentId(req);

    return await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        _count: {
          select: {
            assignedConversations: {
              where: {
                status: AssignmentStatus.COMPLETED,
              },
            },
          },
        },
      },
    });
  }

  @Put('profile')
  async updateAgentProfile(@Body() updateDto: any, @Request() req) {
    const agentId = this.getAgentId(req);

    return await this.prisma.agent.update({
      where: { id: agentId },
      data: updateDto,
    });
  }

  @Put('status')
  async updateStatus(
    @Body() statusDto: { status: AgentStatus },
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    const updatedAgent = await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        status: statusDto.status,
        lastActiveAt: new Date(),
        isOnline: statusDto.status === AgentStatus.ONLINE,
      },
    });

    // Notify admins of status change
    this.websocketService.notifyAdmins({
      type: 'AGENT_STATUS_CHANGED',
      agentId,
      status: statusDto.status,
      timestamp: new Date(),
    });

    return updatedAgent;
  }

  // =============================================================================
  // ASSIGNED CONVERSATIONS
  // =============================================================================

  @Get('assigned-users')
  async getAssignedUsers(@Request() req) {
    const agentId = req.user?.id;

    // If no agentId, return empty array instead of using mock-agent-id
    if (!agentId) {
      return [];
    }

    const assignments = await this.prisma.conversationAssignment.findMany({
      where: {
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
      include: {
        conversation: {
          include: {
            user: {
              select: {
                user_id: true,
                user_session_id: true,
                selected_language: true,
                selected_state: true,
                selected_age_group: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Transform to match frontend expectations
    return assignments.map((assignment) => ({
      id: assignment.conversationId,
      conversationId: assignment.conversationId,
      name: assignment.conversation?.user?.user_session_id || 'Unknown', // Use session ID as name for privacy
      language: assignment.conversation?.user?.selected_language || 'en',
      state: assignment.conversation?.user?.selected_state || 'Unknown',
      ageGroup: assignment.conversation?.user?.selected_age_group || 'Unknown',
      lastMessage: 'Loading messages...',
      lastMessageTime: assignment.assignedAt,
      lastMessageType: 'system',
      assignedAt: assignment.assignedAt,
      priority: assignment.priority,
      unreadCount: 0, // You can calculate this based on read status
    }));
  }

  @Get('conversations/:id/messages')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    // Verify agent has access to this conversation
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId,
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (!assignment) {
      throw new Error('Access denied to this conversation');
    }

    // Get conversation messages
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
      include: {
        agentMessages: {
          orderBy: { sentAt: 'asc' },
          include: {
            agent: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Get regular conversation messages separately
    const conversationMessages = await this.prisma.conversation.findMany({
      where: { conversation_id: conversationId },
      select: {
        message_text: true,
        message_type: true,
        created_at: true,
        widget_name: true,
        selected_option: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Combine and sort all messages
    const allMessages = [
      ...conversationMessages.map((msg) => ({
        text: msg.message_text,
        sender: msg.message_type === 'user' ? 'user' : 'bot',
        timestamp: msg.created_at,
        widget: msg.widget_name,
        selectedOption: msg.selected_option,
      })),
      ...(conversation?.agentMessages || []).map((msg) => ({
        text: msg.messageText,
        sender: 'agent',
        timestamp: msg.sentAt,
        agentName: msg.agent.name,
      })),
    ].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return allMessages;
  }

  // =============================================================================
  // MESSAGING
  // =============================================================================

  @Post('conversations/:id/accept')
  async acceptConversation(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    // Verify agent has this assignment
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId,
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
      include: {
        conversation: {
          include: {
            user: { select: { user_id: true, user_session_id: true } },
          },
        },
        agent: { select: { name: true } },
      },
    });

    if (!assignment) {
      throw new Error('No active assignment found for this conversation');
    }

    // Send "agent joined" message to user via WebSocket
    this.websocketService.notifyConversation(conversationId, {
      type: 'AGENT_JOINED',
      agentId,
      agentName: assignment.agent.name,
      timestamp: new Date(),
    });

    // Notify user directly
    if (assignment.conversation?.user?.user_id) {
      this.websocketService.notifyUser(assignment.conversation.user.user_id, {
        type: 'AGENT_CONNECTED',
        conversationId,
        agentName: assignment.agent.name,
        message: `${assignment.agent.name} has joined the chat`,
        timestamp: new Date(),
      });
    }

    // Notify admins
    this.websocketService.notifyAdmins({
      type: 'CONVERSATION_ACCEPTED',
      conversationId,
      agentId,
      agentName: assignment.agent.name,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Conversation accepted',
      conversation: {
        id: conversationId,
        userName: assignment.conversation.user.user_session_id,
      },
    };
  }

  @Post('messages')
  async sendMessage(
    @Body()
    messageDto: {
      conversationId: string;
      text: string;
      type?: string;
    },
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    // Verify agent has access to this conversation
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId: messageDto.conversationId,
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (!assignment) {
      throw new Error('Access denied to this conversation');
    }

    // Save agent message
    const agentMessage = await this.prisma.agentMessage.create({
      data: {
        conversationId: messageDto.conversationId,
        agentId,
        messageText: messageDto.text,
      },
    });

    // Get conversation details for WebSocket notification
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: messageDto.conversationId },
      include: {
        user: { select: { user_id: true } },
      },
    });

    // Notify user via WebSocket
    this.websocketService.notifyConversation(messageDto.conversationId, {
      type: 'AGENT_MESSAGE',
      message: messageDto.text,
      agentId,
      timestamp: agentMessage.sentAt,
    });

    // Also notify the user directly
    if (conversation?.user?.user_id) {
      this.websocketService.notifyUser(conversation.user.user_id, {
        type: 'NEW_MESSAGE_FROM_AGENT',
        conversationId: messageDto.conversationId,
        message: messageDto.text,
        timestamp: agentMessage.sentAt,
      });
    }

    return { success: true, message: agentMessage };
  }

  @Post('conversations/:id/complete')
  async completeConversation(
    @Param('id') conversationId: string,
    @Body() completionDto: { satisfaction?: number; notes?: string },
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    // Complete current assignment
    await this.prisma.conversationAssignment.updateMany({
      where: {
        conversationId,
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
      data: {
        status: AssignmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        feedback: completionDto.notes,
      },
    });

    // Decrease agent's current chat count
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        currentChats: {
          decrement: 1,
        },
      },
    });

    // Notify user of conversation completion
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
      include: { user: { select: { user_id: true } } },
    });

    if (conversation?.user?.user_id) {
      this.websocketService.notifyUser(conversation.user.user_id, {
        type: 'CONVERSATION_COMPLETED',
        conversationId,
        message:
          'Your conversation with our agent has been completed. Thank you for using our service!',
      });
    }

    return { success: true, message: 'Conversation completed successfully' };
  }

  // =============================================================================
  // UTILITY ENDPOINTS
  // =============================================================================

  @Get('channels')
  async getChannels() {
    // Return available channels for the agent interface
    return [
      { id: '1', name: 'Honey Chatbot - WhatsApp', status: 'active' },
      { id: '2', name: 'Honey Chatbot - Messenger', status: 'active' },
      { id: '3', name: 'Honey Chatbot - Web', status: 'active' },
    ];
  }

  @Get('stats')
  async getAgentStats(@Request() req) {
    const agentId = this.getAgentId(req);

    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        assignedConversations: {
          where: {
            status: AssignmentStatus.ACTIVE,
          },
        },
        _count: {
          select: {
            assignedConversations: {
              where: {
                status: AssignmentStatus.COMPLETED,
              },
            },
          },
        },
      },
    });

    return {
      agentId,
      name: agent?.name,
      status: agent?.status,
      currentChats: agent?.currentChats || 0,
      maxChats: agent?.maxChats || 5,
      completedConversations: agent?._count.assignedConversations || 0,
      activeAssignments: agent?.assignedConversations || [],
    };
  }

  @Post('quick-responses')
  async getQuickResponses(@Query('category') category?: string) {
    // Return pre-defined quick responses for agents
    const quickResponses = {
      greetings: [
        "Hello! I'm here to help you with your family planning questions.",
        'Hi! Thanks for reaching out. How can I assist you today?',
        "Welcome! I'm a family planning specialist ready to help.",
      ],
      clarifications: [
        'Could you please provide more details about your situation?',
        "To better assist you, can you tell me more about what you're looking for?",
        'I want to make sure I understand correctly. Can you clarify?',
      ],
      closings: [
        'Is there anything else I can help you with today?',
        'Thank you for reaching out. Feel free to contact us anytime.',
        'I hope this information was helpful. Have a great day!',
      ],
      referrals: [
        "Based on your needs, I'd recommend visiting a healthcare provider.",
        'For this situation, it would be best to consult with a medical professional.',
        'I can help you find a nearby clinic that specializes in family planning.',
      ],
    };

    return category ? quickResponses[category] : quickResponses;
  }

  @Post('activity/heartbeat')
  async sendHeartbeat(@Request() req) {
    const agentId = this.getAgentId(req);

    await this.prisma.agent.update({
      where: { id: agentId },
      data: { lastActiveAt: new Date() },
    });

    return { success: true, timestamp: new Date() };
  }

  @Post('conversations/:id/transfer')
  async transferConversation(
    @Param('id') conversationId: string,
    @Body() transferDto: { targetAgentId: string; reason?: string },
    @Request() req,
  ) {
    const currentAgentId = this.getAgentId(req);

    // Update assignment to new agent
    const assignment = await this.prisma.conversationAssignment.findFirst({
      where: {
        conversationId,
        agentId: currentAgentId,
        status: 'ACTIVE',
      },
    });

    if (!assignment) {
      throw new NotFoundException('Active assignment not found');
    }

    // Close current assignment
    await this.prisma.conversationAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'TRANSFERRED',
        completedAt: new Date(),
      },
    });

    // Create new assignment
    const newAssignment = await this.prisma.conversationAssignment.create({
      data: {
        conversationId,
        agentId: transferDto.targetAgentId,
        status: 'ACTIVE',
      },
      include: {
        agent: true,
        conversation: true,
      },
    });

    // Update conversation status
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        status: 'AGENT_ASSIGNED',
        assignedAgentId: transferDto.targetAgentId,
      },
    });

    // TODO: Send notification to new agent via WebSocket
    // this.websocketService.emit('conversation_transferred', {
    //   type: 'conversation_transferred',
    //   conversationId,
    //   fromAgent: currentAgentId,
    //   reason: transferDto.reason,
    // });

    return {
      success: true,
      data: newAssignment,
      message: 'Conversation transferred successfully',
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('conversationId') conversationId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // In a real implementation, upload to cloud storage (S3, Azure, etc.)
    // For now, we'll return a mock URL
    const fileUrl = `/uploads/${Date.now()}_${file.originalname}`;

    // Save file metadata to database
    const fileRecord = await this.prisma.agentMessage.create({
      data: {
        conversationId,
        agentId: agentId,
        messageText: `File: ${file.originalname}`,
        // Store file metadata in a separate file tracking table if needed
        // metadata: {
        //   fileName: file.originalname,
        //   fileSize: file.size,
        //   mimeType: file.mimetype,
        //   fileUrl,
        // }
      },
    });

    return {
      success: true,
      data: {
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        messageId: fileRecord.id,
      },
    };
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: any[],
    @Body('conversationId') conversationId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileUrl = `/uploads/${Date.now()}_${file.originalname}`;

        const fileRecord = await this.prisma.agentMessage.create({
          data: {
            conversationId,
            agentId: agentId,
            messageText: `File: ${file.originalname}`,
            // Store file metadata in a separate file tracking table if needed
          },
        });

        return {
          fileUrl,
          fileName: file.originalname,
          fileSize: file.size,
          messageId: fileRecord.id,
        };
      }),
    );

    return {
      success: true,
      data: uploadedFiles,
    };
  }

  @Put('messages/:messageId/read')
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    const message = await this.prisma.agentMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      data: message,
    };
  }

  @Put('conversations/:conversationId/read-all')
  async markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const agentId = this.getAgentId(req);

    // Mark all unread messages in conversation as read
    const result = await this.prisma.agentMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        messagesMarkedRead: result.count,
      },
    };
  }
}
