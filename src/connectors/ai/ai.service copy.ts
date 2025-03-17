import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { openai as openaiModel } from '@ai-sdk/openai';
import { deepseek as deepseekModel } from '@ai-sdk/deepseek'; // Alterado para DeepSeek
import { generateText, tool } from 'ai';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(aiMessageDto: any) {
    const openai = openaiModel('gpt-4o-mini');

    const answer = await generateText({
      model: openai,
      prompt: aiMessageDto.message,
      tools: {
        postgres: tool({
          description: `
            Realiza uma query no banco de dados para buscar informações sobre as tabelas do banco de dados.
            
            So pode realizar consultas(SELECT) no banco de dados, não é permitido realizar nenhuma operação de escrita(INSERT, UPDATE, DELETE).
  
            Tables:
            """
            contacts
            name: contacts ; campos: id, firstName,lastName,nickName,email,phone,statusId,createdAt,updatedAt,comingFrom,documentNumber,createdBy,updatedBy,contactstatusId
           
  
            todas as operacoes devem retornar o maxiomo de 50 itens.
            `.trim(),
          parameters: z.object({
            query: z.string().describe('query para ser executada.'),
            params: z
              .array(z.string())
              .describe('array de parametros para a query.'),
          }),
          execute: async ({ query, params }) => {
            console.log({ query, params });
            const result = await this.prisma.$queryRawUnsafe(query, ...params);
            return JSON.stringify(result);
          },
        }),
      },
      system:
        `você um assistente de I.A. responsável por informar metricas dos contatos cadastrados no sistema.
        
        Inclua na resposta somente o que o usuario pediu, sem nenhum texto adicional.
  
        Se o usuario pedir informacoes sobre quantidade de contatos realize um count se nao retorno somente 10 registos.
  
        O retorno deve ser sempre em markdown (sem incluir \`\`\` no inicio ou no fim).
        `.trim(),
      maxSteps: 10,
    });

    return {
      response: answer.text,
    };
  }
}
