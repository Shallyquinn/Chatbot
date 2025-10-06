import { Module } from '@nestjs/common';
import { ClinicLocationsController } from './clinic-location.controller';
import { ClinicLocationsService } from './clinic-location.service';

@Module({
  controllers: [ClinicLocationsController],
  providers: [ClinicLocationsService],
})
export class ClinicLocationModule {}
