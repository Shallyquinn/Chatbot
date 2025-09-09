import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateChatSessionDto } from './create-session.dto';
import { UpdateChatSessionDto } from './update-chat-session.dto';
import { ChatSessionsService } from './chat-sessions.service';

@Controller('chat-sessions')
export class ChatSessionsController {
    constructor(private readonly service: ChatSessionsService){}

    @Post()
    create(@Body() dto: CreateChatSessionDto) {
        return this.service.create(dto);
    }

    @Put('user/:userSessionId')
    async updateByUserSessionId(
        @Param('userSessionId') userSessionId: string,
        @Body() dto: UpdateChatSessionDto,
    ) {
        return this.service.updateByUserSessionId(userSessionId, dto);
    }

    @Get('user/:userSessionId')
    async listForUser(@Param('userSessionId') userSessionId: string){
        return this.service.listForUser(userSessionId);
    }
    
    @Get(':sessionId')
    list(@Param('sessionId') sessionId: string){
        return this.service.getOne(sessionId)
    }

    @Get()
    async getAll() {
        return this.service.getAll();
    }

}
