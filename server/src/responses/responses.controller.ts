import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './create-response.dto';
import { QueryResponseDto } from './query-response.dto';
import { UpdateResponseDto } from './update-response.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  // Create a new response
  @Post()
  create(@Body() dto: CreateResponseDto) {
    return this.responsesService.create(dto);
  }

  // Get all responses with pagination & filters
  @Get()
  findAll(@Query() query: QueryResponseDto) {
    return this.responsesService.findAll(query);
  }

  // Update response
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResponseDto,
  ) {
    return this.responsesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsesService.remove(id);
  }

  // Get session flow
  @Get('session/:sessionId/flow')
  getSessionFlow(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.responsesService.getSessionResponse(sessionId);
  }

  // Get all responses in a conversation flow
  @Get('conversation/:conversationId/flow')
  getConversationFlow(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.responsesService.getConversationFlow(conversationId);
  }

  // Get responses by category
  @Get('session/:sessionId/category/:category')
  getByCategory(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('category') category: string,
  ) {
    return this.responsesService.getResponsesByCategory(sessionId, category);
  }

  // Get responses by step
  @Get('session/:sessionId/step/:step')
  getByStep(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('step') step: string,
  ) {
    return this.responsesService.getResponsesByStep(sessionId, step);
  }

  //Get latest response in a session
  @Get('session/:sessionId/latest')
  getLatest(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.responsesService.getLatestUserResponse(sessionId);
  }

  // Get single response by ID
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsesService.findOne(id);
  }
}
