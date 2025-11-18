import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { v4 as uuidv4 } from 'uuid';

export interface ChatbotUserData {
  sessionId: string;
  language?: string;
  gender?: string;
  state?: string;
  lga?: string;
  age?: string;
  maritalStatus?: string;
  currentStep?: string;
  conversationHistory?: any[];
  preferences?: {
    familyPlanningGoal?: string;
    selectedMethods?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  upsert(dto: CreateUserDto) {
    // Generate user_session_id if not provided
    const user_session_id = dto.user_session_id || uuidv4();

    return this.prisma.user.upsert({
      where: { user_session_id },
      create: { ...dto, user_session_id },
      update: dto,
      select: { user_id: true, user_session_id: true },
    });
  }

  update(user_session_id: string, dto: UpdateUserDto) {
    // Ensure user_session_id is provided
    const sessionId = user_session_id || uuidv4();

    return this.prisma.user.upsert({
      where: { user_session_id: sessionId },
      create: { user_session_id: sessionId, ...dto },
      update: dto,
      select: { user_id: true, user_session_id: true },
    });
  }

  findBySessionId(sessionId: string) {
    return this.prisma.user.findUnique({
      where: { user_session_id: sessionId },
    });
  }

  async findOne(user_session_id: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_session_id },
    });
    if (!user) throw new NotFoundException('User not Found');
    return user;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  remove(user_session_id: string) {
    return this.prisma.user.delete({
      where: { user_session_id },
    });
  }
}
