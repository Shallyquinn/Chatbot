import { Module } from '@nestjs/common';
import { AgentAssignmentController } from './agent-assignment.controller';
import { AgentAssignmentService } from './agent-assignment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgentAssignmentController],
  providers: [AgentAssignmentService],
  exports: [AgentAssignmentService],
})
export class AgentAssignmentModule {}
