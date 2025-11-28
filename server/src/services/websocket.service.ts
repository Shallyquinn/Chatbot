import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface ConnectedUser {
  userId?: string;
  agentId?: string;
  adminId?: string;
  type: 'user' | 'agent' | 'admin';
  socket: Socket;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebSocketService {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private jwtService: JwtService) {}

  // Connection handling
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  // Register different types of connections
  @SubscribeMessage('register_user')
  handleUserRegistration(
    @MessageBody() data: { userId: string; token?: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📝 WebSocket: User registration request');
    console.log('  User ID:', data.userId);
    console.log('  Socket ID:', client.id);
    console.log('⏰ Timestamp:', new Date().toISOString());

    this.connectedUsers.set(client.id, {
      userId: data.userId,
      type: 'user',
      socket: client,
    });

    client.join(`user_${data.userId}`);

    console.log('✅ User registered successfully');
    console.log('  Room joined:', `user_${data.userId}`);
    console.log('  Total connected users:', this.connectedUsers.size);
  }

  @SubscribeMessage('register_agent')
  handleAgentRegistration(
    @MessageBody() data: { agentId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📝 WebSocket: Agent registration request');
    console.log('  Agent ID:', data.agentId);
    console.log('  Socket ID:', client.id);
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      const payload = this.jwtService.verify(data.token);

      console.log('✅ JWT token verified for agent:', data.agentId);

      this.connectedUsers.set(client.id, {
        agentId: data.agentId,
        type: 'agent',
        socket: client,
      });

      client.join(`agent_${data.agentId}`);
      client.join('agents'); // Join general agents room

      console.log('✅ Agent registered successfully');
      console.log('  Rooms joined:', [`agent_${data.agentId}`, 'agents']);
      console.log('  Total connected agents:', Array.from(this.connectedUsers.values()).filter(u => u.type === 'agent').length);
    } catch (error) {
      console.error('❌ Agent registration failed - Invalid JWT token');
      console.error('  Agent ID:', data.agentId);
      console.error('  Error:', error.message);

      client.emit('auth_error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  @SubscribeMessage('register_admin')
  handleAdminRegistration(
    @MessageBody() data: { adminId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📝 WebSocket: Admin registration request');
    console.log('  Admin ID:', data.adminId);
    console.log('  Socket ID:', client.id);
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      const payload = this.jwtService.verify(data.token);

      console.log('✅ JWT token verified for admin:', data.adminId);

      this.connectedUsers.set(client.id, {
        adminId: data.adminId,
        type: 'admin',
        socket: client,
      });

      client.join(`admin_${data.adminId}`);
      client.join('admins'); // Join general admins room

      console.log('✅ Admin registered successfully');
      console.log('  Rooms joined:', [`admin_${data.adminId}`, 'admins']);
      console.log('  Total connected admins:', Array.from(this.connectedUsers.values()).filter(u => u.type === 'admin').length);
    } catch (error) {
      console.error('❌ Admin registration failed - Invalid JWT token');
      console.error('  Admin ID:', data.adminId);
      console.error('  Error:', error.message);

      client.emit('auth_error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  // Message handling
  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody()
    data: {
      conversationId: string;
      message: string;
      recipientId: string;
      senderType: 'user' | 'agent';
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast message to conversation participants
    this.server.to(`conversation_${data.conversationId}`).emit('new_message', {
      conversationId: data.conversationId,
      message: data.message,
      senderType: data.senderType,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${data.conversationId}`);
    console.log(`Client joined conversation: ${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation_${data.conversationId}`);
    console.log(`Client left conversation: ${data.conversationId}`);
  }

  // Agent-specific notifications
  notifyAgent(agentId: string, data: any) {
    if (!this.server) {
      console.warn(
        '⚠️ WebSocket server not initialized, skipping agent notification',
      );
      return;
    }

    console.log('📢 WebSocket: Sending notification to agent');
    console.log('  Agent ID:', agentId);
    console.log('  Notification Type:', data.type);
    console.log('  Data:', data);
    console.log('  Room:', `agent_${agentId}`);
    console.log('⏰ Timestamp:', new Date().toISOString());

    this.server.to(`agent_${agentId}`).emit('agent_notification', data);

    console.log('✅ Agent notification emitted successfully');
  }

  // Admin-specific notifications
  notifyAdmins(data: any) {
    if (!this.server) {
      console.warn(
        '⚠️ WebSocket server not initialized, skipping admin notification',
      );
      return;
    }

    console.log('📢 WebSocket: Broadcasting to all admins');
    console.log('  Notification Type:', data.type);
    console.log('  Data:', data);
    console.log('  Room: admins');
    console.log('⏰ Timestamp:', new Date().toISOString());

    this.server.to('admins').emit('admin_notification', data);

    console.log('✅ Admin notification broadcasted successfully');
  }

  // User-specific notifications
  notifyUser(userId: string, data: any) {
    if (!this.server) {
      console.warn(
        'WebSocket server not initialized, skipping user notification',
      );
      return;
    }
    this.server.to(`user_${userId}`).emit('user_notification', data);
  }

  // Broadcast to specific conversation
  notifyConversation(conversationId: string, data: any) {
    if (!this.server) {
      console.warn(
        'WebSocket server not initialized, skipping conversation notification',
      );
      return;
    }
    this.server
      .to(`conversation_${conversationId}`)
      .emit('conversation_update', data);
  }

  // Agent status updates
  @SubscribeMessage('agent_status_change')
  handleAgentStatusChange(
    @MessageBody() data: { status: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);

    if (user?.type === 'agent') {
      // Broadcast agent status change to admins
      this.server.to('admins').emit('agent_status_updated', {
        agentId: user.agentId,
        status: data.status,
        timestamp: new Date(),
      });
    }
  }

  // Queue updates
  broadcastQueueUpdate(queueData: any) {
    this.server.to('admins').emit('queue_updated', queueData);
  }

  // Configuration updates
  broadcastConfigUpdate(configData: any) {
    this.server.emit('config_updated', configData);
  }

  // Typing indicators
  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);

    client.to(`conversation_${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userType: user?.type,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);

    client.to(`conversation_${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userType: user?.type,
      isTyping: false,
    });
  }

  // Get connected users count
  getConnectedUsersCount(): { users: number; agents: number; admins: number } {
    let users = 0,
      agents = 0,
      admins = 0;

    this.connectedUsers.forEach((user) => {
      switch (user.type) {
        case 'user':
          users++;
          break;
        case 'agent':
          agents++;
          break;
        case 'admin':
          admins++;
          break;
      }
    });

    return { users, agents, admins };
  }

  // Get active agents
  getActiveAgents(): string[] {
    const agents: string[] = [];
    this.connectedUsers.forEach((user) => {
      if (user.type === 'agent' && user.agentId) {
        agents.push(user.agentId);
      }
    });
    return agents;
  }

  // Emergency broadcast
  emergencyBroadcast(message: string) {
    this.server.emit('emergency_message', {
      message,
      timestamp: new Date(),
      priority: 'URGENT',
    });
  }
}
