import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = admin;
      return result;
    }
    return null;
  }

  loginAdmin(admin: { id: string; email: string; name: string; role: string }) {
    const payload = {
      email: admin.email,
      adminId: admin.id,
      role: admin.role,
      type: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.ADMIN_JWT_SECRET,
        expiresIn: '24h',
      }),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async createDefaultAdmin(): Promise<void> {
    const defaultEmail =
      process.env.DEFAULT_ADMIN_EMAIL || 'admin@honeychatbot.com';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: defaultEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await this.prisma.admin.create({
        data: {
          name: 'Default Admin',
          email: defaultEmail,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        },
      });

      console.log(`Default admin created with email: ${defaultEmail}`);
    }
  }
}
