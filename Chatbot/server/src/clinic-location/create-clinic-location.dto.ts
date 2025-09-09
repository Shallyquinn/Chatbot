import { IsString, IsOptional, IsBoolean, IsDecimal, IsArray, IsEmail } from 'class-validator';

export class CreateClinicLocationDto {
  @IsString()
  clinic_name: string;

  @IsOptional()
  @IsString()
  clinic_type?: string;

  @IsString()
  state: string;

  @IsString()
  lga: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsArray()
  services_offered: string[];

  @IsArray()
  fpm_methods_available: string[];

  @IsOptional()
  consultation_fee?: number;

  @IsOptional()
  @IsString()
  operating_hours?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
