import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { AdminLoginDto, AgentLoginDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('agent/login')
  async agentLogin(@Body() loginDto: AgentLoginDto) {
    return this.authService.agentLogin(loginDto);
  }

  @Get('setup')
  async setupDefaultAdmin() {
    return this.authService.createDefaultAdmin();
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'Authentication successful' };
  }
}
