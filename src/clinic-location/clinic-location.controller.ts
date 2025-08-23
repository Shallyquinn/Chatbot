import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CreateClinicLocationDto } from './create-clinic-location.dto';
import { UpdateClinicLocationDto } from './update-clinic-location.dto';
import { ClinicLocationsService } from './clinic-location.service';

@Controller('clinics')
export class ClinicLocationsController {
  constructor(private readonly clinicLocationsService: ClinicLocationsService) {}

  @Post()
  create(@Body() dto: CreateClinicLocationDto) {
    return this.clinicLocationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.clinicLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicLocationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClinicLocationDto) {
    return this.clinicLocationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicLocationsService.remove(id);
  }
}
