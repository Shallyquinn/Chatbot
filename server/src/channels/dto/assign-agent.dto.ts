import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class AssignAgentDto {
  @IsString()
  agentId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxChats?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;
}
