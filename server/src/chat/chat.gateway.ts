import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: 'admin' | 'agent';
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      client.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };

      // Join role-specific room
      client.join(`${client.user.role}s`);

      this.logger.log(`${client.user.role} ${client.user.email} connected`);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.logger.log(`${client.user.role} ${client.user.email} disconnected`);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.user) return;

    client.join(`conversation_${data.conversationId}`);

    return {
      status: 'joined',
      conversationId: data.conversationId,
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { conversationId: string; content: string; agentId?: string },
  ) {
    if (!client.user || client.user.role !== 'agent') {
      return { error: 'Unauthorized' };
    }

    try {
      // Get conversation details
      const conversation = await this.prisma.conversation.findUnique({
        where: { conversation_id: data.conversationId },
        include: {
          user: true,
        },
      });

      if (!conversation) {
        return { error: 'Conversation not found' };
      }

      // Save message to database as an AgentMessage
      const response = await this.prisma.agentMessage.create({
        data: {
          conversationId: data.conversationId,
          agentId: data.agentId || client.user.id,
          messageText: data.content,
        },
      });

      // Broadcast message to all participants in the conversation
      const messageData = {
        id: response.id,
        conversationId: data.conversationId,
        content: data.content,
        text: data.content,
        sender: 'agent',
        senderType: 'AGENT',
        agentId: response.agentId,
        createdAt: response.sentAt,
        timestamp: response.sentAt,
      };

      this.server
        .to(`conversation_${data.conversationId}`)
        .emit('newMessage', messageData);
      this.server
        .to(`conversation_${data.conversationId}`)
        .emit('new_message', messageData);

      // Notify user specifically
      this.server
        .to(`user_${conversation.user_id}`)
        .emit('new_message', messageData);

      this.logger.log(
        `Message saved and broadcast for conversation ${data.conversationId}`,
      );

      return { status: 'sent', messageId: response.id };
    } catch (error) {
      this.logger.error('Error handling send message:', error);
      return { error: 'Failed to send message' };
    }
  }

  // Method to notify about new conversations
  notifyNewConversation(conversationId: string, userId: string) {
    this.server.to('agents').emit('newConversation', {
      conversationId,
      userId,
      timestamp: new Date(),
    });

    this.server.to('admins').emit('newConversation', {
      conversationId,
      userId,
      timestamp: new Date(),
    });
  }

  // Method to broadcast system-wide announcements
  broadcastAnnouncement(
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
  ) {
    this.server.to('agents').emit('announcement', { message, type });
    this.server.to('admins').emit('announcement', { message, type });
  }
}
