import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './create-referral.dto';
import { UpdateReferralDto } from './update-referral.dto';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  create(@Body() dto: CreateReferralDto) {
    return this.referralsService.create(dto);
  }

  @Get()
  findAll() {
    return this.referralsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referralsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReferralDto) {
    return this.referralsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.referralsService.remove(id);
  }
}
