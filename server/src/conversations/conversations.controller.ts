import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './create-conversation.dto';
import { QueryConversationDto } from './query-conversation.dto';
import { UpdateConversationDto } from './update-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // Create a new conversation
  @Post()
  async create(@Body() dto: CreateConversationDto) {
    return this.conversationsService.create(dto);
  }

  // Get paginated + filtered conversations
  @Get()
  async findAll(@Query() query: QueryConversationDto) {
    return this.conversationsService.findAll(query);
  }

  // Get a single conversation by ID
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.conversationsService.findOne(id);
  }

  // Update a conversation by ID
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, dto);
  }

  // Delete a conversation by ID
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.conversationsService.remove(id);
  }

  //Get a user's conversation history
  @Get('user/:userId/history')
  async getUserHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit = 20,
  ) {
    return this.conversationsService.getUserConversationHistory(
      userId,
      Number(limit),
    );
  }

  // Escalate conversation to human agent
  @Post('escalate')
  async escalateToHuman(
    @Body() body: { conversationId: string; userId: string },
  ) {
    console.log('🎯 POST /conversations/escalate received:', body);
    if (!body.userId) {
      throw new BadRequestException('userId is required');
    }
    const conversation = await this.conversationsService.findLatestConversationByUser(body.userId);
    if (!conversation) {
      throw new BadRequestException('No conversation found for this user');
    }

    return this.conversationsService.escalateToHuman(
      conversation.conversation_id,
      body.userId,
    );
  }

  // Get queue status for conversation
  @Get('queue-status/:conversationId')
  async getQueueStatus(@Param('conversationId') conversationId: string) {
    return this.conversationsService.getQueueStatus(conversationId);
  }

  // Get messages for a conversation
  @Get(':conversationId/messages')
  async getConversationMessages(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('limit') limit = 100,
  ) {
    return this.conversationsService.getConversationMessages(
      conversationId,
      Number(limit),
    );
  }

  // Handle queue timeout
  @Post('queue-timeout')
  async handleQueueTimeout(
    @Body()
    body: {
      conversationId: string;
      queueDuration: number;
      userId: string;
    },
  ) {
    console.log('⏰ POST /conversations/queue-timeout received:', body);
    return this.conversationsService.handleQueueTimeout(
      body.conversationId,
      body.queueDuration,
      body.userId,
    );
  }
}
