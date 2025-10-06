import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsDecimal,
} from 'class-validator';

export class CreateConversationAnalyticsDto {
  @IsOptional() @IsString() session_id?: string;
  @IsOptional() @IsString() user_id?: string;

  @IsOptional() @IsArray() steps_completed?: string[];
  @IsOptional() @IsArray() widgets_interacted_with?: string[];
  @IsOptional() @IsArray() flows_attempted?: string[];

  @IsOptional() @IsInt() total_user_messages?: number;
  @IsOptional() @IsInt() total_bot_messages?: number;
  @IsOptional() @IsInt() total_button_clicks?: number;
  @IsOptional() @IsInt() total_typed_responses?: number;

  @IsOptional() @IsString() session_abandonment_point?: string;

  @IsOptional() @IsArray() information_provided?: string[];
  @IsOptional() @IsArray() goals_achieved?: string[];
  @IsOptional() @IsArray() unresolved_concerns?: string[];
  @IsOptional() @IsInt() satisfaction_rating?: number;

  @IsOptional() average_response_time_seconds?: number;
  @IsOptional() @IsArray() errors_encountered?: string[];
}
