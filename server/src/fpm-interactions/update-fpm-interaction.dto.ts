import { PartialType } from '@nestjs/mapped-types';
import { CreateFpmInteractionDto } from './create-fpm-interaction.dto';

export class UpdateFpmInteractionDto extends PartialType(
  CreateFpmInteractionDto,
) {}
