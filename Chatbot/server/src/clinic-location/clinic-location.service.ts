import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClinicLocationDto } from './create-clinic-location.dto';
import { UpdateClinicLocationDto } from './update-clinic-location.dto';

@Injectable()
export class ClinicLocationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClinicLocationDto) {
    return this.prisma.clinicLocation.create({ data: dto });
  }

  findAll() {
    return this.prisma.clinicLocation.findMany();
  }

  findOne(id: string) {
    return this.prisma.clinicLocation.findUnique({ where: { clinic_id: id } });
  }

  update(id: string, dto: UpdateClinicLocationDto) {
    return this.prisma.clinicLocation.update({
      where: { clinic_id: id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.clinicLocation.delete({ where: { clinic_id: id } });
  }
}
