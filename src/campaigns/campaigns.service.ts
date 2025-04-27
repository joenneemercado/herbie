import { CreateCampaignSchema } from './dto/campaign.schema';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CampaignContantes } from './campaign.constantes';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(body: {
    idAudience?: number[];
    name?: string;
    message?: string;
    typeMessage?: number;
    sendingBy?: string;
    statusId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
    priority?: number;
    channelId?: number;
    tags?: number[];
    dateStart?: string;
    dateEnd?: string;
    jsonMeta?: string;
    subject?: string;
    organization_id: string;
  }) {
    const {
      dateStart,
      dateEnd,
      channelId,
      typeMessage,
      message,
      jsonMeta,
      statusId,
      subject,
      createdBy,
      organization_id,
      idAudience,
      name,
      priority,
      tags,
    } = body;
    // console.log(body);
    try {
      const beginDate = dateStart ? new Date(dateStart + 'Z') : null;
      const finalDate = dateEnd ? new Date(dateEnd + 'Z') : null;
      const now = new Date();
      const dataInicio = beginDate
        ? beginDate
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
      const dataFim = finalDate
        ? finalDate
        : new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            -1,
          );
      return await this.prisma.$transaction(
        async (trxCampaing) => {
          //TODO VERFICIAR SE JA EXISTE UM CANAL PRA CAMPANHA
          const findChannel = await trxCampaing.channels.findFirst({
            where: {
              id: channelId,
            },
          });
          if (!findChannel) {
            throw new HttpException(
              `This channel: ${channelId} not found`,
              404,
            );
          }

          const findTags = await trxCampaing.tags.findMany({
            where: {
              id: {
                in: tags, // Verifica se os IDs das tags existem no banco
              },
            },
          });

          //console.log('findTags', findTags);

          // Verifica se o array está vazio
          if (findTags.length === 0) {
            throw new HttpException(`this tags: ${tags} not found`, 404);
          }

          const findAudience = await trxCampaing.audiences.findMany({
            where: {
              id: {
                in: idAudience, // Verifica se os IDs das tags existem no banco
              },
              organization_id: organization_id,
            },
          });
          //console.log('findAudience', findAudience);
          // Verifica se o array está vazio
          if (findAudience.length === 0) {
            throw new HttpException(
              `this audience: ${findAudience} not found`,
              404,
            );
          }

          //TODO DTO PARA CRIAR CAMPANHA
          const camp = await trxCampaing.campaigns.create({
            data: {
              name: name,
              message: message,
              typeMessage: typeMessage,
              idChannel: channelId,
              sendingBy: findChannel.type,
              statusId: statusId ? statusId : Number(1),
              dateStart: dataInicio,
              dateEnd: dataFim,
              priority: priority,
              jsonMeta: jsonMeta ? jsonMeta : undefined,
              subject: subject ? subject : undefined,
              createdBy: createdBy,
              organization_id: organization_id,
            },
          });
          //console.log('Campanha criada:', camp);
          // Rastrear IDs de contato únicos usando um Set
          const uniqueContactIds = new Set<number>();

          //TODO VERIFICA SE JÁ EXISTE UMA AUDIENCIA
          for (const audiencia of idAudience) {
            //console.log('audiencia', audiencia);
            const campAudi = await trxCampaing.campaignaudience.create({
              data: {
                idCampaign: camp.id,
                idAudience: audiencia,
                organization_id: organization_id,
              },
            });
            //  console.log('campAudi', campAudi);

            // preciso dos contatos da audincia para adicionar na campaigndetails
            const audContacts = await trxCampaing.audiencescontacts.findMany({
              where: {
                idAudience: audiencia,
                organization_id: organization_id,
              },
            });
            // console.log('audContacts', audContacts);

            // Adiciona contatos únicos ao Set
            audContacts.forEach((contact) => {
              uniqueContactIds.add(contact.idContact);
            });
          }

          //console.log('uniqueContactIds', uniqueContactIds);
          // Cria os dados para inserir no banco
          const associationTagsData = tags.map((tag) => ({
            idTag: tag, // Cada tag será inserida separadamente
            idCampaing: camp.id,
            organization_id: organization_id,
            createdBy: 1,
          }));
          // console.log('associationTagsData', associationTagsData);
          // Realiza o insert usando createMany
          const associationTags = await trxCampaing.associationtags.createMany({
            data: associationTagsData,
            skipDuplicates: true, // Opcional: evita duplicatas, caso já existam associações
          });
          // console.log('associationTags', associationTags);

          // Prepara os dados finais para inserir no campaigndetails
          const campaignDetailsData = Array.from(uniqueContactIds).map(
            (idContact) => ({
              idCampaign: camp.id,
              idContact,
              statusId: 1,
              organization_id: organization_id,
            }),
          );
          // console.log('campaignDetailsData', campaignDetailsData);

          const campaignInterationData = Array.from(uniqueContactIds).map(
            (idContact) => ({
              details: camp,
              organization_id: organization_id,
              type: CampaignContantes.EVENT_TYPE_CAMPAING,
              source_id: CampaignContantes.SOURCE_ID_CAMPAING,
              event_id: CampaignContantes.EVENT_ID_CAMPAING,
              created_by: 1,
              customer_unified_Id: idContact,
              status_id: 17,
            }),
          );
          // console.log('campaignInterationData', campaignInterationData);
          if (campaignInterationData.length > 0) {
            const insertedInterationCampaing =
              await trxCampaing.interaction.createMany({
                data: campaignInterationData,
                skipDuplicates: true,
              });
            // console.log(
            //   'Inserted campaign details:',
            //   insertedInterationCampaing,
            // );
          }

          if (campaignDetailsData.length > 0) {
            const insertedDetails =
              await trxCampaing.campaigndetails.createMany({
                data: campaignDetailsData,
                skipDuplicates: true,
              });
            // console.log('Inserted campaign details:', insertedDetails);
            // const insrtedInterationCampaing = await trxCampaing.interaction.
          }
          return {
            campaign: camp,
            audience: idAudience,
            qtdContact: campaignDetailsData.length,
          };
        },
        {
          maxWait: 5000,
          timeout: 500000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      console.log(`erro ao criar a campanha`, error);
      throw new HttpException(error.message, error.status);
    }
    //return 'This action adds a new campaign';
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    organization_id: string;
    name?: string;
    statusId?: number;
    createdBy?: number;
  }) {
    const { page, limit, organization_id, name, statusId, createdBy } = query;
    const skip = (page - 1) * limit;

    const filters = {
      AND: [
        organization_id ? { organization_id: organization_id } : {},
        name ? { name: { contains: name } } : {},
        statusId ? { statusId: statusId } : {},
        createdBy ? { createdBy: createdBy } : {},
      ],
    };
    try {
      const [campaign, totalCampaigns] = await Promise.all([
        this.prisma.campaigns.findMany({
          skip,
          take: Number(limit),
          where: filters,
          include: {
            campaignstatus: {
              select: {
                id: true,
                name: true,
              },
            },
            Associationtags: {
              include: {
                tags: true,
              },
            },
            campaignaudience: {
              include: {
                audiences: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            campaigndetails: true,
          },
          orderBy: [
            { updatedAt: 'desc' },
            { priority: 'desc' },
            { statusId: 'asc' },
          ],
        }),
        this.prisma.audiences.count({ where: filters }),
        // this.prisma.campaigndetails.count({ where: { statusId: { in: CampaignContantes.QTD_CAMPAING_DETAILS_ENVIADO, }, }, })
      ]);
      return {
        data: campaign,
        totalCampaigns,
        //qtdMsgEnviadas:qtdMsgEnviadas,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCampaigns / limit),
      };
    } catch (error) {
      console.log(`erro ao procurar campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findOne(id: number, organization_id: string) {
    //console.log(id,organization_id)
    try {
      const campanha = await this.prisma.campaigns.findFirst({
        where: {
          id: id,
          organization_id: organization_id,
        },
      });
      if (!campanha) {
        throw new HttpException('Campanha nao existe', 404);
      }
      return campanha;
    } catch (error) {
      console.log(`erro ao procurar id da campanha`, error);
      throw new HttpException(error.message, error.status);
    }
    //return `This action returns a #${id} campaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaign`;
  }

  async findCampaignDetails(
    createCampaignDto: CreateCampaignSchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      //console.log('createCampaignDto', createCampaignDto);
      const limit = Number(createCampaignDto.limit) || 10;
      const cursor = createCampaignDto.cursor
        ? Number(createCampaignDto.cursor)
        : undefined;

      const campanha = await this.prisma.campaigndetails.findMany({
        where: {
          idCampaign: Number(createCampaignDto.id),
          organization_id: createCampaignDto.organization_id,
        },
        include: {
          CustomerUnified: true,
          campaigndetailsstatus: true,
        },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'asc',
        },
      });

      if (!campanha) {
        throw new HttpException('Campanha nao existe', 404);
      }

      //console.log('campanha', campanha);
      //console.log('log interaction', interactions);
      const itemsOnPage = campanha.length;
      const total = await this.prisma.campaigndetails.count({
        where: {
          organization_id: createCampaignDto.organization_id,
          idCampaign: Number(createCampaignDto.id),
        },
      });

      const nextCursor =
        campanha.length === limit ? campanha[campanha.length - 1].id : null;

      const totalPages = Math.ceil(total / limit);

      const data = campanha.map((item) => ({
        firstName: item.CustomerUnified.firstname,
        lastName: item.CustomerUnified.lastname,
        phone: item.CustomerUnified.phone,
        sender: item.sender,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        statusId: item.campaigndetailsstatus.name,
      }));

      return {
        data, // Dados da consulta
        pageInfo: {
          total, // Total de itens no banco
          itemsOnPage, // Itens retornados na página atual
          nextCursor, // ID do próximo cursor
          totalPages, // Total de páginas
        },
      };
    } catch (error) {
      console.log(`erro ao procurar detalhes da campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }
}
