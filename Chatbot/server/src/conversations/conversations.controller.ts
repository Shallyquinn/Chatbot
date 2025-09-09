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
}