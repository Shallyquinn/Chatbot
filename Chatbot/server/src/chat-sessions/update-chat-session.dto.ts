import { PartialType } from '@nestjs/mapped-types';
import { CreateChatSessionDto } from './create-session.dto';


export class UpdateChatSessionDto extends PartialType(CreateChatSessionDto) {}