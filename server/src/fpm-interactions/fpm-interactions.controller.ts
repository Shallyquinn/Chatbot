import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateFpmInteractionDto } from './create-fpm-interaction.dto';
import { UpdateFpmInteractionDto } from './update-fpm-interaction.dto';
import { FpmInteractionsService } from './fpm-interactions.service';

@Controller('fpm-interactions')
export class FpmInteractionController {
  constructor(private readonly fpmInteractionService: FpmInteractionsService) {}

  @Post()
  create(@Body() dto: CreateFpmInteractionDto) {
    return this.fpmInteractionService.create(dto);
  }

  @Get()
  findAll() {
    return this.fpmInteractionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fpmInteractionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFpmInteractionDto) {
    return this.fpmInteractionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fpmInteractionService.remove(id);
  }
}
