import { Test, TestingModule } from '@nestjs/testing';
import { FpmInteractionsController } from './fpm-interactions.controller';

describe('FpmInteractionsController', () => {
  let controller: FpmInteractionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FpmInteractionsController],
    }).compile();

    controller = module.get<FpmInteractionsController>(
      FpmInteractionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
