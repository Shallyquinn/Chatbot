import { Test, TestingModule } from '@nestjs/testing';
import { ClinicLocationController } from './clinic-location.controller';

describe('ClinicLocationController', () => {
  let controller: ClinicLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicLocationController],
    }).compile();

    controller = module.get<ClinicLocationController>(ClinicLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
