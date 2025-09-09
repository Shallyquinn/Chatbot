import { PartialType } from '@nestjs/mapped-types';
import { CreateConversationAnalyticsDto } from './create-conversation-analytics.dto';

export class UpdateConversationAnalyticsDto extends PartialType(CreateConversationAnalyticsDto) {}