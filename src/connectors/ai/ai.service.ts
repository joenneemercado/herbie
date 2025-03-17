import { Injectable } from '@nestjs/common';

//1import { deepseek as deepseekModel } from '@ai-sdk/deepseek'; // Alterado para DeepSeek
//import { openai as openaiModel } from '@ai-sdk/openai';
//import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { PrismaService } from '@src/database/prisma.service';
import { AiMessageDto } from './ai.dto';
import { postgresTool } from './tools/postgres-tool';
import { google } from '@ai-sdk/google';
import { mysqlTool } from './tools/mysql-tool';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(aiMessageDto: AiMessageDto) {
    //const openaiModelLocal = openaiModel('gpt-4');
    //const model = google('gemini-1.5-pro-latest');
    const model = google('gemini-2.0-flash');

    // const lmstudio = createOpenAICompatible({
    //   name: 'lmstudio',
    //   baseURL: 'http://localhost:1234/v1',
    // });

    console.log(aiMessageDto.message);

    const answer = await generateText({
      //model: lmstudio('llama-3.2-1b-instruct'),
      model: model,
      prompt: aiMessageDto.message,
      tools: {
        postgresTool,
        //mysqlTool,
      },
      system:
        `você é um assistente de I.A. responsável por informar métricas no sistema.
        
        Inclua na resposta somente o que o usuário pediu, sem nenhum texto adicional.
  
        Se o usuário pedir informações sobre quantidade de contatos, realize um count. Se não, retorne somente 50 registros.


        O retorno deve ser sempre em markdown (sem incluir \`\`\` ou \\ no início ou no fim).
        `.trim(),
      maxSteps: 7,
      temperature: 0.9,
    });

    return {
      response: answer.text,
    };
  }

  async testeQuery() {
    try {
      const query = `SELECT COUNT(*) AS total_unified FROM "herbie-novaera"."CustomerUnified"`;
      const params = [];
      const result = await this.prisma.$queryRawUnsafe(query, ...params);
      return JSON.stringify(result, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      );
    } catch (error) {
      console.log(error);
      throw new Error('Error executing the query');
    }
  }
}
