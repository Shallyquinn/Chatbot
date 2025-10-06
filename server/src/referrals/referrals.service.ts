import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReferralDto } from './create-referral.dto';
import { UpdateReferralDto } from './update-referral.dto';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateReferralDto) {
    return this.prisma.userClinicReferral.create({ data: dto });
  }

  findAll() {
    return this.prisma.userClinicReferral.findMany({
      include: { clinic: true, user: true, session: true },
    });
  }

  findOne(id: string) {
    return this.prisma.userClinicReferral.findUnique({
      where: { referral_id: id },
      include: { clinic: true, user: true, session: true },
    });
  }

  update(id: string, dto: UpdateReferralDto) {
    return this.prisma.userClinicReferral.update({
      where: { referral_id: id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.userClinicReferral.delete({
      where: { referral_id: id },
    });
  }
}
