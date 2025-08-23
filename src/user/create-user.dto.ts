import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  user_session_id: string;

  @IsOptional() @IsString() selected_language?: string | null;
  @IsOptional() @IsString() selected_gender?: string | null;
  @IsOptional() @IsString() selected_state?: string | null;
  @IsOptional() @IsString() selected_lga?: string | null;
  @IsOptional() @IsString() selected_age_group?: string | null;
  @IsOptional() @IsString() selected_marital_status?: string | null;
  @IsOptional() @IsString() current_step?: string;
  @IsOptional() @IsString() current_fpm_method?: string | null;
  @IsOptional() @IsString() current_concern_type?: string | null;
  @IsOptional() @IsString() user_intention?: string | null;
}