import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFpmInteractionDto } from './create-fpm-interaction.dto';
import { UpdateFpmInteractionDto } from './update-fpm-interaction.dto';

@Injectable()
export class FpmInteractionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFpmInteractionDto) {
    // Validate that session exists if session_id is provided
    if (dto.session_id) {
      const sessionExists = await this.prisma.chatSession.findUnique({
        where: { session_id: dto.session_id },
      });

      if (!sessionExists) {
        throw new NotFoundException(
          `Chat session ${dto.session_id} not found. Please ensure session is created first.`,
        );
      }
    }

    return this.prisma.fpmInteraction.create({ data: dto });
  }

  async findAll() {
    return this.prisma.fpmInteraction.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const interaction = await this.prisma.fpmInteraction.findUnique({
      where: { interaction_id: id },
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
    return interaction;
  }

  async update(id: string, dto: UpdateFpmInteractionDto) {
    try {
      return await this.prisma.fpmInteraction.update({
        where: { interaction_id: id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Interaction with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.fpmInteraction.delete({
        where: { interaction_id: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Interaction with ID ${id} not found`);
      }
      throw error;
    }
  }
}
