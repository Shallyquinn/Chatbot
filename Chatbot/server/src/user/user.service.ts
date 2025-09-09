import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

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
        return this.prisma.user.upsert({
            where: { user_session_id: dto.user_session_id},
            create: dto,
            update: dto,
            select: {user_id:true, user_session_id:true}
        });
    }

    update(user_session_id: string, dto: UpdateUserDto) {
        return this.prisma.user.upsert({
            where: {user_session_id},
            create: {user_session_id, ...dto},
            update: dto,
            select: {user_id:true, user_session_id:true}
        });
    }

    findBySessionId(sessionId: string) {
        return this.prisma.user.findUnique({where: {user_session_id: sessionId}})
    }

    async findOne(user_session_id: string) {
        const user = await this.prisma.user.findUnique({
            where: {user_session_id},
        });
        if (!user) throw new NotFoundException('User not Found');
        return user;
    }

    findAll() {
        return this.prisma.user.findMany();
    }

    remove(user_session_id: string) {
        return this.prisma.user.delete({
            where: {user_session_id}
        })
    }
}
