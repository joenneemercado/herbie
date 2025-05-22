import {
  CampaingContactDtochema,
  CampaingDetailsDtochema,
  CreateCampaignDtoSchema,
  FindCampaignchema,
  UpdateCampaignDtoSchema,
} from './dto/campaign.schema';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';
import { Prisma } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createCampaingDto: CreateCampaignDtoSchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    //console.log(createCampaingDto);
    try {
      const beginDate = createCampaingDto.dateStart
        ? new Date(createCampaingDto.dateStart + 'Z')
        : null;
      const finalDate = createCampaingDto.dateEnd
        ? new Date(createCampaingDto.dateEnd + 'Z')
        : null;
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
      const tagsArray = createCampaingDto.tags
        ? Array.isArray(createCampaingDto.tags)
          ? createCampaingDto.tags
          : [createCampaingDto.tags]
        : [];

      const tagsAudience = createCampaingDto.idAudience
        ? Array.isArray(createCampaingDto.idAudience)
          ? createCampaingDto.idAudience
          : [createCampaingDto.idAudience]
        : [];
      return await this.prisma.$transaction(
        async (trxCampaing) => {
          //TODO VERFICIAR SE JA EXISTE UM CANAL PRA CAMPANHA
          const findChannel = await trxCampaing.channels.findFirst({
            where: {
              id: createCampaingDto.channelId,
            },
          });
          if (!findChannel) {
            throw new HttpException(
              `This channel: ${createCampaingDto.channelId} not found`,
              404,
            );
          }

          const findTags = await trxCampaing.tags.findMany({
            where: {
              id: {
                in: tagsArray,
              },
            },
          });

          // console.log('findTags', findTags);

          // Verifica se o array está vazio
          if (findTags.length === 0) {
            throw new HttpException(
              `this tags: ${createCampaingDto.tags} not found`,
              404,
            );
          }

          const findAudience = await trxCampaing.audiences.findMany({
            where: {
              id: {
                in: tagsAudience, // Verifica se os IDs das tags existem no banco
              },
              organization_id: createCampaingDto.organization_id,
            },
          });
          // console.log('findAudience', findAudience);
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
              name: createCampaingDto.name,
              message: createCampaingDto.message,
              type_message: createCampaingDto.typeMessage,
              channel_id: createCampaingDto.channelId,
              sending_by: findChannel.type,
              status_id: createCampaingDto.statusId
                ? createCampaingDto.statusId
                : Number(1),
              date_start: dataInicio,
              date_end: dataFim,
              priority: createCampaingDto.priority,
              json_meta: createCampaingDto.jsonMeta
                ? createCampaingDto.jsonMeta
                : undefined,
              subject: createCampaingDto.subject
                ? createCampaingDto.subject
                : undefined,
              created_by: createCampaingDto.createdBy,
              organization_id: createCampaingDto.organization_id,
            },
          });
          // console.log('Campanha criada:', camp);
          // Rastrear IDs de contato únicos usando um Set
          const uniqueContactIds = new Set<number>();

          //TODO VERIFICA SE JÁ EXISTE UMA AUDIENCIA
          for (const audiencia of findAudience) {
            //console.log('audiencia', audiencia);
            await trxCampaing.campaignAudience.create({
              data: {
                campaign_id: camp.id,
                audience_id: audiencia.id,
                organization_id: createCampaingDto.organization_id,
              },
            });
            //console.log('campAudi', campAudi);

            // preciso dos contatos da audincia para adicionar na campaigndetails
            const audContacts = await trxCampaing.audiencesContacts.findMany({
              where: {
                audience_id: audiencia.id,
                organization_id: createCampaingDto.organization_id,
              },
            });
            //console.log('audContacts', audContacts);

            // Adiciona contatos únicos ao Set
            audContacts.forEach((contact) => {
              uniqueContactIds.add(contact.contact_id);
            });
          }

          //console.log('uniqueContactIds', uniqueContactIds);
          // Cria os dados para inserir no banco
          const associationTagsData = findTags.map((tag) => ({
            tag_id: tag.id,
            campaing_id: camp.id,
            organization_id: createCampaingDto.organization_id,
            created_by: 1,
          }));

          //console.log('associationTagsData', associationTagsData);
          // Realiza o insert usando createMany
          await trxCampaing.associationTags.createMany({
            data: associationTagsData,
            skipDuplicates: true, // Opcional: evita duplicatas, caso já existam associações
          });
          //console.log('associationTags', associationTags);

          // Prepara os dados finais para inserir no campaigndetails
          const campaignDetailsData = Array.from(uniqueContactIds).map(
            (idContact) => ({
              campaign_id: camp.id,
              contact_id: idContact,
              status_id: 1,
              organization_id: createCampaingDto.organization_id,
            }),
          );
          //console.log('campaignDetailsData', campaignDetailsData);

          if (campaignDetailsData.length > 0) {
            await trxCampaing.campaignDetails.createMany({
              data: campaignDetailsData,
              skipDuplicates: true,
            });
            //console.log('Inserted campaign details:', insertedDetails);
            // const insrtedInterationCampaing = await trxCampaing.interaction.
          }
          return {
            campaign: camp,
            audience: findAudience.map((a) => a.id),
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

  async findAll(findCampaingDto: FindCampaignchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      // console.log(findCampaingDto);
      const skip = (findCampaingDto.page - 1) * findCampaingDto.limit;
      const limit = Number(findCampaingDto.limit) || 10;
      const currentPage = Number(findCampaingDto.page) || 1;

      const filtersCampaing = [];

      if (findCampaingDto.id) {
        filtersCampaing.push({ id: findCampaingDto.id });
      }
      if (findCampaingDto.name) {
        filtersCampaing.push({
          name: {
            contains: findCampaingDto.name,
            mode: 'insensitive', // faz com que o filtro ignore maiúsculas/minúsculas
          },
        });
      }
      if (findCampaingDto.status_id) {
        filtersCampaing.push({ status_id: findCampaingDto.status_id });
      }
      if (findCampaingDto.created_by) {
        filtersCampaing.push({ created_by: findCampaingDto.created_by });
      }
      if (findCampaingDto.channel_id) {
        filtersCampaing.push({ channel_id: findCampaingDto.channel_id });
      }

      const whereConditionCampaing = {
        AND: [...filtersCampaing],
      };
      // console.log(JSON.stringify(whereConditionCampaing));

      const data = await this.prisma.campaigns.findMany({
        where: {
          organization_id: findCampaingDto.organization_id,
          ...whereConditionCampaing,
        },
        select: {
          id: true,
          name: true,
          message: true,
          date_start: true,
          date_end: true,
          CampaignStatus: {
            select: {
              id: true,
              name: true,
            },
          },
          AssociationTags: {
            select: {
              Tags: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              CampaignDetails: true,
            },
          },
          // CampaignAudience: {
          //   include: {
          //     Audiences: {
          //       select: {
          //         name: true,
          //       },
          //     },
          //   },
          // },
          Channels: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        // include: {
        //   //CampaignDetails: true,
        // },
        orderBy: [
          { updated_at: 'desc' },
          { priority: 'desc' },
          { status_id: 'asc' },
        ],
        skip,
        take: Number(limit),
      });

      const totalItems = await this.prisma.campaigns.count({
        where: {
          organization_id: findCampaingDto.organization_id,
          ...whereConditionCampaing,
        },
      });

      const totalPages = Math.ceil(totalItems / limit);
      return {
        data,
        pageInfo: {
          totalItems,
          currentPage,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findCampaignDetails(
    campaingDetailsDto: CampaingDetailsDtochema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      //console.log('createCampaignDto', createCampaignDto);
      const skip = (campaingDetailsDto.page - 1) * campaingDetailsDto.limit;
      const limit = Number(campaingDetailsDto.limit) || 10;
      const currentPage = Number(campaingDetailsDto.page) || 1;

      const data = await this.prisma.campaignDetails.findMany({
        where: {
          campaign_id: Number(campaingDetailsDto.id),
          organization_id: campaingDetailsDto.organization_id,
        },
        select: {
          sender: true,
          created_at: true,
          sent_at: true,
          CustomerUnified: {
            select: {
              firstname: true,
              lastname: true,
              phone: true,
              email: true,
            },
          },
          CampaignDetailsStatus: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: Number(limit),
      });

      const Campaign = await this.prisma.campaigns.findFirst({
        where: {
          id: Number(campaingDetailsDto.id),
          organization_id: campaingDetailsDto.organization_id,
        },

        select: {
          name: true,
          message: true,
          date_start: true,
          date_end: true,
          priority: true,
          created_at: true,
          updated_at: true,
          updated_by: true,
          Channels: {
            select: {
              name: true,
            },
          },
          AssociationTags: {
            select: {
              Tags: {
                select: {
                  name: true,
                },
              },
            },
          },
          CampaignStatus: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!data) {
        throw new HttpException('Campanha nao existe', 404);
      }
      const totalItems = await this.prisma.campaignDetails.count({
        where: {
          campaign_id: Number(campaingDetailsDto.id),
          organization_id: campaingDetailsDto.organization_id,
        },
      });

      const totalPages = Math.ceil(totalItems / limit);
      return {
        campaignInfo: Campaign,
        campaignDetails: data,
        pageInfo: {
          totalItems,
          currentPage,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar detalhes da campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findCampaignContacts(
    campaingContactDto: CampaingContactDtochema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip = (campaingContactDto.page - 1) * campaingContactDto.limit;
      const limit = Number(campaingContactDto.limit) || 10;
      const currentPage = Number(campaingContactDto.page) || 1;

      const data = await this.prisma.campaignDetails.findMany({
        where: {
          contact_id: Number(campaingContactDto.customer_unified_id),
          organization_id: campaingContactDto.organization_id,
        },
        select: {
          sent_at: true,
          updated_at: true,
          Campaigns: {
            select: {
              id: true,
              name: true,
              message: true,
              Channels: {
                select: {
                  name: true,
                },
              },
            },
          },
          CampaignDetailsStatus: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        // take: limit,
        // cursor: cursor ? { id: cursor } : undefined,
        // orderBy: {
        //   id: 'asc',
        // },
        skip,
        take: Number(limit),
      });

      if (!data) {
        throw new HttpException('Campanha nao existe', 404);
      }

      //console.log('campanha', campanha);
      //console.log('log interaction', interactions);
      //const itemsOnPage = campanha.length;
      const totalItems = await this.prisma.campaignDetails.count({
        where: {
          organization_id: campaingContactDto.organization_id,
          contact_id: Number(campaingContactDto.customer_unified_id),
        },
      });

      // const nextCursor =
      //   campanha.length === limit ? campanha[campanha.length - 1].id : null;

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pageInfo: {
          totalItems,
          currentPage,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar detalhes da campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getCampaingCustomer(
    organization_id: string,
    contact_id: string, // id do contato
    page = 1,
    limit = 10,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Busca as campanhas onde o contato faz parte (JOIN com campaignDetails)
      const data = await this.prisma.campaigns.findMany({
        where: {
          organization_id,
          CampaignDetails: {
            some: {
              organization_id,
              contact_id: Number(contact_id),
            },
          },
        },
        select: {
          id: true,
          name: true,
          message: true,
          created_at: true,
          Channels: {
            select: {
              name: true,
            },
          },
          CampaignStatus: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updated_at: 'desc' }, // opcional
      });

      // Conta total para paginação
      const totalItems = await this.prisma.campaigns.count({
        where: {
          organization_id,
          CampaignDetails: {
            some: {
              organization_id,
              contact_id: Number(contact_id),
            },
          },
        },
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pageInfo: {
          totalItems,
          currentPage: page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log('falhou ao buscar campanhas do usuário', error);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async update(updateCampaignDto: UpdateCampaignDtoSchema, req: Request) {
    try {
      // console.log('updateCampaignDto', updateCampaignDto);
      const reqToken = req.headers['authorization'];
      if (!reqToken) {
        throw new UnauthorizedException();
      }
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub } = await this.jwtService.decode(token);

      const findCampaign = await this.prisma.campaigns.findFirst({
        where: {
          id: updateCampaignDto.id,
          organization_id: updateCampaignDto.organization_id,
        },
      });
      if (findCampaign) {
        await this.prisma.campaigns.update({
          where: {
            id: findCampaign.id,
          },
          data: {
            status_id: updateCampaignDto.status_id
              ? updateCampaignDto.status_id
              : findCampaign.status_id,
            priority: updateCampaignDto.priority
              ? updateCampaignDto.priority
              : findCampaign.priority,
            updated_by: sub,
          },
        });
        return {
          code: HttpStatus.CREATED,
          message: 'Campanha atualizada com sucesso',
        };
      } else {
        return {
          code: HttpStatus.NOT_FOUND,
          message: 'Campanha não encontrada',
        };
      }
    } catch (error) {
      console.log('Erro ao atualizar campanha:', error);
      throw new HttpException('Erro ao atualizar campanha', error.status);
    }
  }
}
