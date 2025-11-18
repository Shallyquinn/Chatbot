import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from './websocket.service';
import {
  AgentStatus,
  Priority,
  DayOfWeek,
  Agent,
  AgentShift,
  AgentAvailability,
  NotificationType,
  NotificationStatus,
} from '@prisma/client';

interface AssignmentResult {
  success: boolean;
  agentId?: string;
  agentName?: string;
  requiresAdminApproval: boolean;
  queuePosition?: number;
  estimatedWaitTime?: number;
  message: string;
}

interface LocationData {
  state?: string;
  lga?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: string | number | undefined;
}

type AgentWithShifts = Agent & {
  shifts: AgentShift[];
  availabilityWindows: AgentAvailability[];
};

@Injectable()
export class ChatAssignmentService {
  private readonly logger = new Logger(ChatAssignmentService.name);

  constructor(
    private prisma: PrismaService,
    private websocketService: WebSocketService,
  ) {}

  /**
   * Request agent escalation - Main entry point
   * Implements the full logic: Admin online -> manual, Admin offline -> auto-assign
   */
  async requestAgentEscalation(
    conversationId: string,
    userId: string,
    priority: Priority = Priority.NORMAL,
    userLocation?: LocationData,
  ): Promise<AssignmentResult> {
    this.logger.log(
      `Agent escalation requested for conversation: ${conversationId}`,
    );

    try {
      // Step 1: Check if any admin is currently online
      const onlineAdmin = await this.isAdminOnline();

      if (onlineAdmin) {
        // Admin is online - add to queue for manual assignment
        return await this.queueForManualAssignment(
          conversationId,
          userId,
          priority,
          userLocation,
        );
      } else {
        // No admin online - auto-assign to available agent
        return await this.autoAssignToAgent(
          conversationId,
          userId,
          priority,
          userLocation,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in requestAgentEscalation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if any admin is currently online
   */
  private async isAdminOnline(): Promise<boolean> {
    // Check if there's an active admin session in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeAdmin = await this.prisma.admin.findFirst({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    return !!activeAdmin;
  }

  /**
   * Queue conversation for manual admin assignment
   */
  private async queueForManualAssignment(
    conversationId: string,
    userId: string,
    priority: Priority,
    userLocation?: LocationData,
  ): Promise<AssignmentResult> {
    // Get current queue position
    const queueCount = await this.prisma.conversationQueue.count({
      where: {
        status: 'WAITING',
      },
    });

    // Calculate estimated wait time (2 minutes per queued conversation)
    const estimatedWait = Math.max(2, queueCount * 2);

    // Add to queue
    await this.prisma.conversationQueue.create({
      data: {
        conversationId,
        userId,
        priority,
        estimatedWait,
        status: 'WAITING',
      },
    });

    // Update conversation status to QUEUED
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        escalationStatus: 'QUEUED',
        escalatedAt: new Date(),
        escalationReason: 'User requested human agent',
      },
    });

    // Notify all admins
    await this.notifyAdmins(conversationId, userId, userLocation, priority);

    this.logger.log(
      `Conversation ${conversationId} queued for admin assignment. Position: ${queueCount + 1}`,
    );

    return {
      success: true,
      requiresAdminApproval: true,
      queuePosition: queueCount + 1,
      estimatedWaitTime: estimatedWait,
      message: `Your request has been queued. An admin will assign an agent shortly. Estimated wait: ${estimatedWait} minutes.`,
    };
  }

  /**
   * Auto-assign to available agent based on location and availability
   */
  private async autoAssignToAgent(
    conversationId: string,
    userId: string,
    priority: Priority,
    userLocation?: LocationData,
  ): Promise<AssignmentResult> {
    this.logger.log(`Auto-assigning conversation ${conversationId} to agent`);

    // Find best available agent
    const agent = await this.findBestAvailableAgent(userLocation);

    if (!agent) {
      // No agent available - add to queue anyway
      return await this.queueForManualAssignment(
        conversationId,
        userId,
        priority,
        userLocation,
      );
    }

    // Assign conversation to agent
    await this.assignConversationToAgent(conversationId, agent.id, priority);

    // Notify the agent
    await this.notifyAgent(agent.id, conversationId, userId, userLocation);

    this.logger.log(
      `Conversation ${conversationId} auto-assigned to agent ${agent.name}`,
    );

    return {
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      requiresAdminApproval: false,
      message: `You've been connected to ${agent.name}. They'll be with you shortly.`,
    };
  }

  /**
   * Find best available agent based on:
   * 1. Currently online
   * 2. Within shift hours
   * 3. Not at max chat capacity
   * 4. Closest location match (if location provided)
   */
  private async findBestAvailableAgent(
    userLocation?: LocationData,
  ): Promise<AgentWithShifts | null> {
    const currentDay = this.getCurrentDayOfWeek() as DayOfWeek;
    const currentTime = this.getCurrentTime();

    // Base query: online, not busy, has capacity
    const availableAgents = await this.prisma.agent.findMany({
      where: {
        isOnline: true,
        status: {
          in: [AgentStatus.ONLINE, AgentStatus.AWAY],
        },
        currentChats: {
          lt: this.prisma.agent.fields.maxChats,
        },
      },
      include: {
        shifts: {
          where: {
            dayOfWeek: currentDay,
            isActive: true,
          },
        },
        availabilityWindows: {
          where: {
            isActive: true,
          },
        },
      },
    });

    // Filter agents who are currently in their shift hours
    const agentsInShift = availableAgents.filter((agent) => {
      // If no shift defined, consider available 24/7
      if (agent.shifts.length === 0) return true;

      // Check if current time is within shift hours
      return agent.shifts.some((shift) =>
        this.isTimeInRange(currentTime, shift.startTime, shift.endTime),
      );
    });

    if (agentsInShift.length === 0) {
      this.logger.warn('No agents available within shift hours');
      return null;
    }

    // If user location provided, find closest agent
    if (userLocation && (userLocation.state || userLocation.lga)) {
      const closestAgent = this.findClosestAgent(agentsInShift, userLocation);
      if (closestAgent) {
        return closestAgent;
      }
    }

    // Otherwise, return agent with least current chats (load balancing)
    return agentsInShift.reduce((prev, current) =>
      prev.currentChats < current.currentChats ? prev : current,
    );
  }

  /**
   * Find agent closest to user location
   */
  private findClosestAgent(
    agents: AgentWithShifts[],
    userLocation: LocationData,
  ): AgentWithShifts | null {
    // Priority 1: Exact LGA match
    if (userLocation.lga) {
      const lgaMatch = agents.find(
        (agent) =>
          agent.lga &&
          agent.lga.toLowerCase() === userLocation.lga.toLowerCase(),
      );
      if (lgaMatch) {
        this.logger.log(`Found agent in same LGA: ${lgaMatch.name}`);
        return lgaMatch;
      }
    }

    // Priority 2: Same state
    if (userLocation.state) {
      const stateMatch = agents.find(
        (agent) =>
          agent.state &&
          agent.state.toLowerCase() === userLocation.state.toLowerCase(),
      );
      if (stateMatch) {
        this.logger.log(`Found agent in same state: ${stateMatch.name}`);
        return stateMatch;
      }
    }

    // Priority 3: Geographic distance (if lat/lng available)
    if (
      userLocation.latitude &&
      userLocation.longitude &&
      agents.some((a) => a.latitude && a.longitude)
    ) {
      const agentsWithCoords = agents.filter((a) => a.latitude && a.longitude);

      if (agentsWithCoords.length > 0) {
        const closestByDistance = agentsWithCoords.reduce((prev, current) => {
          const prevDist = this.calculateDistance(
            userLocation.latitude!,
            userLocation.longitude!,
            Number(prev.latitude),
            Number(prev.longitude),
          );
          const currentDist = this.calculateDistance(
            userLocation.latitude!,
            userLocation.longitude!,
            Number(current.latitude),
            Number(current.longitude),
          );
          return prevDist < currentDist ? prev : current;
        });

        this.logger.log(
          `Found closest agent by distance: ${closestByDistance.name}`,
        );
        return closestByDistance;
      }
    }

    // No location match - return first available
    return agents[0];
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Assign conversation to specific agent
   */
  private async assignConversationToAgent(
    conversationId: string,
    agentId: string,
    priority: Priority,
  ): Promise<void> {
    // Create assignment
    await this.prisma.conversationAssignment.create({
      data: {
        conversationId,
        agentId,
        priority,
        status: 'ACTIVE',
        assignedAt: new Date(),
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: {
        escalationStatus: 'ASSIGNED',
        assignedAgentId: agentId,
        assignedAt: new Date(),
      },
    });

    // Increment agent's current chat count
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        currentChats: {
          increment: 1,
        },
        status: AgentStatus.BUSY,
      },
    });

    // Remove from queue if exists
    await this.prisma.conversationQueue.deleteMany({
      where: { conversationId },
    });
  }

  /**
   * Notify all admins about new escalation request
   */
  private async notifyAdmins(
    conversationId: string,
    userId: string,
    userLocation?: LocationData,
    priority?: Priority,
  ): Promise<void> {
    const admins = await this.prisma.admin.findMany();

    const notifications = admins.map((admin) => ({
      adminId: admin.id,
      type: NotificationType.ESCALATION_REQUEST,
      status: NotificationStatus.UNREAD,
      title: 'New Agent Request',
      message: `A user has requested to speak with a human agent. ${priority === Priority.HIGH ? '(HIGH PRIORITY)' : ''}`,
      conversationId,
      userId,
      metadata: {
        userLocation,
        priority,
        timestamp: new Date().toISOString(),
      },
    }));

    await this.prisma.adminNotification.createMany({
      data: notifications,
    });

    this.logger.log(
      `Notified ${admins.length} admins about escalation request`,
    );

    // TODO: Send email notifications to offline admins
    // await this.sendEmailNotifications(admins, conversationId);
  }

  /**
   * Notify specific agent about assignment
   */
  private async notifyAgent(
    agentId: string,
    conversationId: string,
    userId: string,
    userLocation?: LocationData,
  ): Promise<void> {
    // Create database notification
    await this.prisma.agentNotification.create({
      data: {
        agentId,
        type: NotificationType.AGENT_ASSIGNED,
        status: NotificationStatus.UNREAD,
        title: 'New Chat Assigned',
        message: 'You have been assigned a new conversation.',
        conversationId,
      },
    });

    // Send real-time WebSocket notification
    try {
      this.websocketService.notifyAgent(agentId, {
        type: 'NEW_ASSIGNMENT',
        conversationId,
        userId,
        userLocation,
        priority: 'HIGH',
        message: 'New conversation assigned to you',
      });
      this.logger.log(`Real-time notification sent to agent ${agentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send WebSocket notification to agent ${agentId}:`,
        error,
      );
    }

    this.logger.log(`Notified agent ${agentId} about new assignment`);

    // TODO: Send push notification / email if agent is offline
  }

  /**
   * Utility: Get current day of week
   */
  private getCurrentDayOfWeek(): string {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[new Date().getDay()];
  }

  /**
   * Utility: Get current time in HH:mm format
   */
  private getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * Utility: Check if time is within range
   */
  private isTimeInRange(
    currentTime: string,
    startTime: string,
    endTime: string,
  ): boolean {
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Manual assignment by admin
   */
  async assignByAdmin(
    conversationId: string,
    agentId: string,
    adminId: string,
  ): Promise<AssignmentResult> {
    this.logger.log(
      `Admin ${adminId} manually assigning conversation ${conversationId} to agent ${agentId}`,
    );

    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if agent is available
    if (agent.currentChats >= agent.maxChats) {
      throw new Error('Agent is at maximum chat capacity');
    }

    await this.assignConversationToAgent(
      conversationId,
      agentId,
      Priority.NORMAL,
    );

    const user = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
      include: { user: true },
    });

    await this.notifyAgent(agentId, conversationId, user.user_id);

    return {
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      requiresAdminApproval: false,
      message: `Conversation assigned to ${agent.name}`,
    };
  }
}
