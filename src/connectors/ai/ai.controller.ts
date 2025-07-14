import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiAskDto, AiMessageDto } from './ai.dto';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }
  
  @Post('message')
  @ApiOperation({ summary: 'Enviar mensagem para IA com consulta ao banco de dados' })
  @ApiBody({ type: AiMessageDto })
  @ApiResponse({ status: 200, description: 'Resposta da IA com dados do banco' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() aiMessageDto: AiMessageDto) {
    return await this.aiService.create(aiMessageDto);
  }

  @Post('ask')
  @ApiOperation({ summary: 'Enviar pergunta para endpoint externo de IA' })
  @ApiBody({ type: AiAskDto })
  @ApiResponse({ status: 200, description: 'Resposta do endpoint externo' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async ask(@Body() aiMessageDto: AiAskDto) {
    return await this.aiService.ask(aiMessageDto);
  }
  // @Post('teste')
  // teste() {
  //   return this.aiService.testeQuery();
  // }
}
