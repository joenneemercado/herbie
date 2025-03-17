import { Body, Controller, Post } from '@nestjs/common';
import { AiMessageDto } from './ai.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('message')
  async create(@Body() aiMessageDto: AiMessageDto) {
    return await this.aiService.create(aiMessageDto);
  }

  @Post('teste')
  teste() {
    return this.aiService.testeQuery();
  }
}
