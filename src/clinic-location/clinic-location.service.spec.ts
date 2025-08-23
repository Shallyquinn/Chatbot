import { Test, TestingModule } from '@nestjs/testing';
import { ClinicLocationService } from './clinic-location.service';

describe('ClinicLocationService', () => {
  let service: ClinicLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicLocationService],
    }).compile();

    service = module.get<ClinicLocationService>(ClinicLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
