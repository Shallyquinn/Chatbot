import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create or upsert a user
  @Post()
  async createOrUpdate(@Body() dto: CreateUserDto) {
  const user = await this.userService.upsert(dto);
  return { id: user.user_id, sessionId: user.user_session_id }; // include the database id!
}

  // Update user by session ID
  @Patch('session/:sessionId')
  updateBySession(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(sessionId, dto);
  }

  // Find user by session ID
  @Get('session/:sessionId')
  findBySessionId(@Param('sessionId') sessionId: string) {
    return this.userService.findBySessionId(sessionId);
  }

  // Get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Find user by user_session_id
  @Get(':id')
  findOne(@Param('id') user_session_id: string) {
    return this.userService.findOne(user_session_id);
  }

  // Delete user by user_session_id
  @Delete(':id')
  remove(@Param('id') user_session_id: string) {
    return this.userService.remove(user_session_id);
  }
}
