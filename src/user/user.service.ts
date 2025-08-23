import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    upsert(dto: CreateUserDto) {
        return this.prisma.user.upsert({
            where: { user_session_id: dto.user_session_id},
            create: dto,
            update: dto,
        });
    }

    update(user_session_id: string, dto: UpdateUserDto) {
        return this.prisma.user.update({
            where: {user_session_id},
            data:dto,
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
