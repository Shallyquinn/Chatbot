import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [JwtModule],
  providers: [AgentsService, PrismaService],
  controllers: [AgentsController],
  exports: [AgentsService],
})
export class AgentsModule {}
