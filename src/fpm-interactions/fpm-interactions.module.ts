import { Module } from '@nestjs/common';
import { FpmInteractionController } from './fpm-interactions.controller';
import { FpmInteractionsService } from './fpm-interactions.service';

@Module({
  controllers: [FpmInteractionController],
  providers: [FpmInteractionsService],
  exports: [FpmInteractionsService]
})
export class FpmInteractionsModule {}
