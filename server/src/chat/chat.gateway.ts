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

  constructor(private jwtService: JwtService) {}

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
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    if (!client.user || client.user.role !== 'agent') {
      return { error: 'Unauthorized' };
    }

    // Broadcast message to all participants in the conversation
    this.server.to(`conversation_${data.conversationId}`).emit('newMessage', {
      conversationId: data.conversationId,
      content: data.content,
      sender: 'AGENT',
      agentId: client.user.id,
      createdAt: new Date(),
    });

    return { status: 'sent' };
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
