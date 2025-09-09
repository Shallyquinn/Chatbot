import { Test, TestingModule } from '@nestjs/testing';
import { FpmInteractionsService } from './fpm-interactions.service';

describe('FpmInteractionsService', () => {
  let service: FpmInteractionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FpmInteractionsService],
    }).compile();

    service = module.get<FpmInteractionsService>(FpmInteractionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
