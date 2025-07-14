// import { Injectable } from '@nestjs/common';

// //1import { deepseek as deepseekModel } from '@ai-sdk/deepseek'; // Alterado para DeepSeek
// //import { openai as openaiModel } from '@ai-sdk/openai';
// //import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// import { generateText } from 'ai';
// import { PrismaService } from '@src/database/prisma.service';
// import { AiMessageDto } from './ai.dto';
// import { postgresTool } from './tools/postgres-tool';
// import { google } from '@ai-sdk/google';
// import { mysqlTool } from './tools/mysql-tool';

// @Injectable()
// export class AiService {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(aiMessageDto: AiMessageDto) {
//     //const openaiModelLocal = openaiModel('gpt-4');
//     //const model = google('gemini-1.5-pro-latest');
//     const model = google('gemini-2.0-flash');

//     // const lmstudio = createOpenAICompatible({
//     //   name: 'lmstudio',
//     //   baseURL: 'http://localhost:1234/v1',
//     // });

//     console.log(aiMessageDto.message);

//     const answer = await generateText({
//       //model: lmstudio('llama-3.2-1b-instruct'),
//       model: model,
//       prompt: aiMessageDto.message,
//       tools: {
//         postgresTool,
//         //mysqlTool,
//       },
//       system:
//         `você é um assistente de I.A. responsável por informar métricas no sistema.

//         Inclua na resposta somente o que o usuário pediu, sem nenhum texto adicional.

//         Se o usuário pedir informações sobre quantidade de contatos, realize um count. Se não, retorne somente 50 registros.

//         O retorno deve ser sempre em markdown (sem incluir \`\`\` ou \\ no início ou no fim).
//         `.trim(),
//       maxSteps: 7,
//       temperature: 0.9,
//     });

//     return {
//       response: answer.text,
//     };
//   }

//   async testeQuery() {
//     try {
//       const query = `SELECT COUNT(*) AS total_unified FROM "herbie-novaera"."CustomerUnified"`;
//       const params = [];
//       const result = await this.prisma.$queryRawUnsafe(query, ...params);
//       return JSON.stringify(result, (_, value) =>
//         typeof value === 'bigint' ? Number(value) : value,
//       );
//     } catch (error) {
//       console.log(error);
//       throw new Error('Error executing the query');
//     }
//   }
// }

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { azure } from '@ai-sdk/azure';
import { createAzure } from '@ai-sdk/azure';
import { generateText, tool, LanguageModel } from 'ai';
import { z } from 'zod';
import { PrismaService } from '@src/database/prisma.service';
import { AiMessageDto } from './ai.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AiAskDto } from './ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // O ConfigService é injetado para gerenciar variáveis de ambiente de forma segura.
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  async create(aiMessageDto: AiMessageDto) {
    /**
     * Ferramenta segura para consulta ao banco de dados.
     */
    const postgresTool = tool({
      description:
        'Executa uma consulta SQL somente leitura no banco de dados PostgreSQL. Apenas comandos SELECT são permitidos.',
      parameters: z.object({
        query: z
          .string()
          .describe(
            'A consulta SQL a ser executada. Deve ser um comando SELECT válido.',
          ),
      }),
      execute: async ({ query }) => {
        this.logger.log(`AI is attempting to execute query: ${query}`);

        const forbiddenCommands =
          /^\s*(insert|update|delete|drop|alter|truncate|grant|revoke)\b/i;

        if (forbiddenCommands.test(query)) {
          this.logger.warn(`Blocked forbidden SQL command: ${query}`);
          return {
            error:
              'Erro: Apenas consultas SELECT de leitura são permitidas. A operação foi bloqueada.',
          };
        }

        try {
          const result = await this.prisma.$queryRawUnsafe(query);
          return JSON.stringify(result, (_, value) =>
            typeof value === 'bigint' ? Number(value) : value,
          );
        } catch (error) {
          this.logger.error(`Error executing SQL query: ${query}`, error.stack);
          return {
            error: `A consulta falhou com o seguinte erro: ${error.message}`,
          };
        }
      },
    });

    // --- Seleção Dinâmica do Modelo de IA ---
    let model: LanguageModel;
    const aiProvider = this.configService.get<string>('AI_PROVIDER', 'azure');

    this.logger.log(`Using AI Provider: ${aiProvider}`);

    if (aiProvider.toLowerCase() === 'azure') {
      // --- Configuração para Azure OpenAI ---
      // **MUITO IMPORTANTE:** Suas variáveis de ambiente PRECISAM estar neste formato.
      // O erro 'getaddrinfo ENOTFOUND https' acontece se AZURE_RESOURCE_NAME contiver 'https://'.
      //
      // Exemplo de .env CORRETO:
      // AZURE_RESOURCE_NAME="iaem"
      // AZURE_DEPLOYMENT_NAME="development-gpt-4.1-3"
      // AZURE_API_VERSION="2024-02-01"
      // AZURE_API_KEY="sua-chave-de-api-aqui"

      const deploymentName = this.configService.get<string>(
        'AZURE_OPENAI_CHAT_DEPLOYMENT_NAME',
      );
      const resourceName = this.configService.get<string>(
        'AZURE_OPENAI_ENDPOINT',
      );
      const apiVersion = this.configService.get<string>('API_VERSION');
      const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');

      console.log(`Using Azure Deployment: ${deploymentName}`);
      console.log(`Using Azure Resource Name: ${resourceName}`);
      console.log(`Using Azure API Version: ${apiVersion}`);
      if (!deploymentName || !resourceName || !apiKey || !apiVersion) {
        throw new InternalServerErrorException(
          'As variáveis de ambiente do Azure (DEPLOYMENT_NAME, RESOURCE_NAME, API_KEY, API_VERSION) não estão configuradas corretamente.',
        );
      }
      console.log({
        resourceName: resourceName, // Azure resource name
        apiKey: apiKey,
        apiVersion: apiVersion, // Azure API version
      });
      // CORREÇÃO OFICIAL: Primeiro, cria-se a instância do provedor Azure com as configurações.
      const azure = createAzure({
        //baseURL: resourceName, // Azure resource name
        apiKey: apiKey,
        resourceName: resourceName, // Azure resource name
        apiVersion: apiVersion, // Azure API version
      });

      // Em seguida, seleciona-se o modelo de chat a partir do provedor.

      model = azure(deploymentName) as LanguageModel;
    } else {
      // --- Configuração para Google Gemini (padrão) ---
      const modelName =
        this.configService.get<string>('GOOGLE_MODEL_NAME') ||
        'gemini-1.5-pro-latest';
      model = google(modelName, {
        // A chave da API do Google também é lida de process.env.GOOGLE_API_KEY por padrão
      }) as LanguageModel;
    }

    /**
     * Prompt do Sistema Detalhado.
     */
    const systemPrompt = `
      Eu devo responder em português.

      Você é um agente projetado para interagir com um banco de dados SQL.
      Dada uma pergunta de entrada, crie uma consulta em PostgreSQL sintaticamente correta para executar, depois olhe para os resultados da consulta e retorne a resposta.
      A menos que seja instruído a obter um número específico de exemplos, limite a consulta a no máximo 50 resultados.
      Nunca consulte todas as colunas de uma tabela, apenas as colunas relevantes para a pergunta.

      **REGRAS DE SEGURANÇA IMPORTANTES:**
      - **NUNCA, sob nenhuma circunstância, gere um comando SQL que modifique o banco de dados. Isso inclui \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`DROP\`, \`ALTER\`, \`TRUNCATE\`, \`GRANT\`, \`REVOKE\`.
      - Apenas consultas \`SELECT\` são permitidas e serão executadas pela ferramenta.

      Lembre-se de algumas regras importantes do negócio ao gerar a consulta:
      1. A tabela principal para informações de clientes é \`CustomerUnified\`. Quase todas as perguntas sobre clientes devem usar esta tabela.
      2. Os valores monetários nas tabelas \`Order\` e \`OrderItem\` (como \`total\`, \`price\`, etc.) estão armazenados em centavos. Para obter o valor em Reais, você DEVE dividir o valor por 100.
      3. Para perguntas sobre aniversário, a coluna \`date_birth\` nas tabelas \`Customer\` e \`CustomerUnified\` armazena a data de nascimento completa. Use as funções de data do PostgreSQL para extrair o dia e o mês. Por exemplo, \`EXTRACT(DAY FROM date_birth) = 16\` e \`EXTRACT(MONTH FROM date_birth) = 7\`.
      4. Para encontrar clientes que compraram um produto específico, você precisa juntar \`CustomerUnified\` com \`Order\` e depois com \`OrderItem\`. A consulta deve filtrar pelo nome do produto na coluna \`name\` da tabela \`OrderItem\`.
      5. Para encontrar clientes que compraram de um vendedor (\`seller\`) específico, você precisa juntar \`CustomerUnified\` com \`Order\` e depois com \`Seller\`. A consulta deve filtrar pelo nome do vendedor na coluna \`name\` da tabela \`Seller\`.
      6. Para perguntas sobre clientes que NÃO compraram em um determinado período, use uma subconsulta com \`NOT EXISTS\` ou \`LEFT JOIN\` com uma verificação de \`IS NULL\`.
      7. No PostgreSQL, nomes de tabelas e colunas com letras maiúsculas são sensíveis ao caso e devem estar entre aspas duplas (ex: "CustomerUnified", "OrderItem").
      8. Para consultas que envolvem cliente sempre busque usar o id do cliente, que é a coluna \`id\` na tabela \`CustomerUnified\`. Isso garante que você obtenha resultados precisos e evita ambiguidades.

      O retorno final deve ser sempre em markdown (sem incluir \`\`\` ou \\ no início ou no fim). Inclua na resposta somente o que o usuário pediu, sem nenhum texto adicional.
    `.trim();

    try {
      const answer = await generateText({
        model: model,
        prompt: aiMessageDto.message,
        tools: {
          sqlQuery: postgresTool,
        },
        system: systemPrompt,
        maxSteps: 7,
        temperature: 0.2,
      });

      const finalResponse = answer.toolResults
        ? `Resultado da consulta: ${JSON.stringify(answer.toolResults)}`
        : answer.text;

      return {
        response: finalResponse,
      };
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      throw new InternalServerErrorException(
        'Falha ao obter uma resposta do serviço de IA.',
      );
    }
  }

  async ask(aiAskDto: AiAskDto) {
    try {
      const url = 'https://jg4okgss80gwcck04cs8ks4w.5.161.215.194.sslip.io/ask';
      const payload = { question: aiAskDto.ask };
      const response$ = this.httpService.post(url, payload);
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao chamar o endpoint externo /ask:', error);
      throw new InternalServerErrorException('Falha ao obter resposta do endpoint externo.');
    }
  }
}
