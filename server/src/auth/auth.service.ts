import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AgentLoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  type: 'admin' | 'agent';
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Admin Authentication
  async adminLogin(loginDto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  // Agent Authentication
  async agentLogin(loginDto: AgentLoginDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { email: loginDto.email },
    });

    if (!agent) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      agent.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update agent status to online
    await this.prisma.agent.update({
      where: { id: agent.id },
      data: {
        isOnline: true,
        status: 'ONLINE',
        lastActiveAt: new Date(),
      },
    });

    const payload = {
      sub: agent.id,
      email: agent.email,
      type: 'agent',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        status: 'ONLINE',
        maxChats: agent.maxChats,
        currentChats: agent.currentChats,
      },
    };
  }

  // Create default admin (for initial setup)
  async createDefaultAdmin() {
    const adminExists = await this.prisma.admin.findFirst();
    if (adminExists) {
      return adminExists;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    return this.prisma.admin.create({
      data: {
        name: 'Default Admin',
        email: 'admin@honeychatbot.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
  }

  // Validate JWT token
  async validateToken(payload: any) {
    if (payload.type === 'admin') {
      return await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });
    } else if (payload.type === 'agent') {
      return await this.prisma.agent.findUnique({
        where: { id: payload.sub },
      });
    }
    return null;
  }
}
