import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AiMessageDto {
  @ApiProperty({
    name: 'message',
    description: 'The content of the message',
    type: String,
    required: true,
  })
  @IsString()
  message: string;
}

export class AiAskDto {
  @ApiProperty({
    name: 'ask',
    description: 'The content of the ask',
    type: String,
    required: true,
  })
  @IsString()
  ask: string;
}