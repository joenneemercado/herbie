import { Process, Processor } from '@nestjs/bull';
import { AudiencesService } from '@src/campaigns/audiences/audiences.service';
import { PrismaService } from '@src/database/prisma.service';
//import { AudiencesService } from '@src/campaigns/audiences/audiences.service';
//import { PrismaService } from '@src/database/prisma.service';
//import { PrismaService } from '@src/database/prisma.service';
import { bucket } from '@src/firebase';
import type { Job } from 'bullmq';
import * as fastcsv from 'fast-csv';
//@Injectable()
@Processor('audience-queue')
export class AudienceFileProcessor {
  constructor(
    private readonly audiencesService: AudiencesService,
    private prisma: PrismaService,
  ) {
    //console.log('Iniciando Worker audience');
  }

  async createAudience(nameAudience: string, organization_id: string) {
    try {
      const audience = await this.prisma.audiences.create({
        data: {
          name: nameAudience,
          organization_id: organization_id,
          status_id: 3, // 3 = PROCESSANDO
          created_by: 1,
        },
      });

      return {
        id: audience.id,
        name: audience.name,
      };
    } catch (error) {
      console.error(`Erro durante o processamento da audiência :`, error);
      // Relança o erro para que o worker do Bull saiba que o job falhou.
      throw new Error('Falha ao processar e vincular contatos da audiência.');
    }
  }

  async findCustomerIdsByIdentifiers(
    organization_id: string,
    identifiers: { emails?: string[]; phones?: string[] },
  ): Promise<number[]> {
    const todosEmails = identifiers.emails || [];
    const todosCelulares = identifiers.phones || [];
    //console.log('identifiers', identifiers);

    if (todosEmails.length === 0 && todosCelulares.length === 0) {
      return [];
    }

    const batchSize = 1000;
    const idsEncontrados = new Set<number>();
    const totalItems = Math.max(todosEmails.length, todosCelulares.length);

    try {
      for (let i = 0; i < totalItems; i += batchSize) {
        const batchEmails = todosEmails.slice(i, i + batchSize);
        const batchCelulares = todosCelulares.slice(i, i + batchSize);

        const whereOR = [];
        if (batchEmails.length > 0)
          whereOR.push({ email: { in: batchEmails } });
        if (batchCelulares.length > 0)
          whereOR.push({ phone: { in: batchCelulares } });

        if (whereOR.length === 0) continue;

        const results = await this.prisma.customerUnified.findMany({
          where: { organization_id, OR: whereOR },
          select: { id: true },
        });
        results.forEach((c) => idsEncontrados.add(c.id));
      }
      return Array.from(idsEncontrados);
    } catch (error) {
      console.error(`Erro ao buscar contatos em lotes:`, error);
      throw new Error('Falha ao buscar contatos no banco de dados.');
    }
  }

  async createAudienceWithCustomerIds(
    organization_id: string,
    audienceId: number,
    audienceName: string,
    listaDeIds: number[],
  ) {
    if (listaDeIds.length === 0) {
      return 0;
    }
    try {
      // PASSO 2: Executa o trabalho pesado de inserir os contatos em lotes.
      const batchSize = 1000;
      let totalCriado = 0;

      for (let i = 0; i < listaDeIds.length; i += batchSize) {
        const batchDeIds = listaDeIds.slice(i, i + batchSize);

        // Cada createMany é uma transação atômica para seu próprio lote.
        const result = await this.prisma.audiencesContacts.createMany({
          data: batchDeIds.map((idContact) => ({
            organization_id,
            contact_id: idContact,
            audience_id: audienceId,
            created_by: 1,
            status_id: 1,
          })),
          skipDuplicates: true,
        });
        totalCriado += result.count;
      }

      await this.prisma.audiences.update({
        where: { id: audienceId },
        data: {
          status_id: 1,
          updated_at: new Date(),
        },
      });

      console.log(
        `Audiência ${audienceName} ID: ${audienceId} processada com sucesso com ${totalCriado} contatos.`,
      );
      return totalCriado;
    } catch (error) {
      console.error(
        `Erro durante o processamento da audiência '${audienceName}':`,
        error,
      );

      await this.prisma.audiences.update({
        where: { id: audienceId },
        data: {
          status_id: 4,
          updated_at: new Date(),
          obs: `Erro durante o processamento: ${error.message}`,
        },
      });
      console.log(
        `Status da audiência '${audienceName}' (ID: ${audienceId}) atualizado para "Erro".`,
      );
      throw new Error('Falha ao processar e vincular contatos da audiência.');
    }
  }

  //todo metodo atual
  @Process('import-audience-file-queue')
  async process(job: Job): Promise<void> {
    const { filePath: fileName, organization_id, audienceName } = job.data;
    // console.log('dadosProcessor', fileName, organization_id, audienceName);
    // console.log(`[Job ${job.id}] Iniciando processamento para: ${fileName}`);
    const creatingAudience = await this.createAudience(
      audienceName,
      organization_id,
    );
    return new Promise<void>((resolve, reject) => {
      const remoteFile = bucket.file(fileName);
      const readStream = remoteFile.createReadStream();

      const emailsDoArquivo = new Set<string>();
      const celularesDoArquivo = new Set<string>();

      readStream
        .pipe(
          fastcsv.parse({ headers: true, delimiter: ';', ignoreEmpty: true }),
        )
        .on('data', (row: any) => {
          const email = row['EMAIL']?.trim();
          const celular = row['CELULAR']?.trim();
          //console.log(row);
          if (email) emailsDoArquivo.add(email);
          if (celular) celularesDoArquivo.add(celular);
        })
        .on('error', (err) => {
          console.error(`[Job ${job.id}] Erro ao ler o stream do CSV:`, err);
          reject(err);
        })
        .on('end', async () => {
          try {
            console.log(`[Job ${job.id}] Leitura do arquivo finalizada.`);
            // console.log(
            //   `[Job ${job.id}] Chamando serviço para buscar todos os contatos...`,
            // );
            const listaFinalDeIds = await this.findCustomerIdsByIdentifiers(
              organization_id,
              {
                emails: Array.from(emailsDoArquivo),
                phones: Array.from(celularesDoArquivo),
              },
            );

            console.log(
              `[Job ${job.id}] Busca finalizada. Total de clientes únicos encontrados: ${listaFinalDeIds.length}`,
            );

            if (listaFinalDeIds.length === 0) {
              console.log(
                `[Job ${job.id}] Nenhum cliente correspondente encontrado. Concluindo.`,
              );
              resolve();
              return;
            }

            // --- CRIAÇÃO DA AUDIÊNCIA (já estava otimizado) ---
            // console.log(
            //   `[Job ${job.id}] Chamando serviço para criar audiência ${creatingAudience.name}...`,
            // );
            const createAudience = await this.createAudienceWithCustomerIds(
              organization_id,
              creatingAudience.id,
              creatingAudience.name,
              listaFinalDeIds,
            );
            console.log(
              `[Job ${job.id}] PROCESSO CONCLUÍDO COM SUCESSO - AUDIENCIA CONTATOS CRIADA: ${createAudience}`,
            );
            resolve();
          } catch (error) {
            console.error(
              `[Job ${job.id}] Erro na fase de processamento no banco:`,
              error,
            );
            reject(error);
          }
        });
    });
  }
}
