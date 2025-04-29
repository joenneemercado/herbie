import {
  CampaingContactDtochema,
  CampaingDetailsDtochema,
  CreateCampaignDtoSchema,
  FindCampaignchema,
} from './dto/campaign.schema';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  // async create(body: {
  //   idAudience?: number[];
  //   name?: string;
  //   message?: string;
  //   typeMessage?: number;
  //   sendingBy?: string;
  //   statusId?: number;
  //   createdAt?: Date;
  //   updatedAt?: Date;
  //   createdBy?: number;
  //   updatedBy?: number;
  //   priority?: number;
  //   channelId?: number;
  //   tags?: number[];
  //   dateStart?: string;
  //   dateEnd?: string;
  //   jsonMeta?: string;
  //   subject?: string;
  //   organization_id: string;
  // }) {
  //   const {
  //     dateStart,
  //     dateEnd,
  //     channelId,
  //     typeMessage,
  //     message,
  //     jsonMeta,
  //     statusId,
  //     subject,
  //     createdBy,
  //     organization_id,
  //     idAudience,
  //     name,
  //     priority,
  //     tags,
  //   } = body;
  //   // console.log(body);
  //   try {
  //     const beginDate = dateStart ? new Date(dateStart + 'Z') : null;
  //     const finalDate = dateEnd ? new Date(dateEnd + 'Z') : null;
  //     const now = new Date();
  //     const dataInicio = beginDate
  //       ? beginDate
  //       : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
  //     const dataFim = finalDate
  //       ? finalDate
  //       : new Date(
  //           now.getFullYear(),
  //           now.getMonth(),
  //           now.getDate() + 1,
  //           0,
  //           0,
  //           -1,
  //         );
  //     return await this.prisma.$transaction(
  //       async (trxCampaing) => {
  //         //TODO VERFICIAR SE JA EXISTE UM CANAL PRA CAMPANHA
  //         const findChannel = await trxCampaing.channels.findFirst({
  //           where: {
  //             id: channelId,
  //           },
  //         });
  //         if (!findChannel) {
  //           throw new HttpException(
  //             `This channel: ${channelId} not found`,
  //             404,
  //           );
  //         }

  //         const findTags = await trxCampaing.tags.findMany({
  //           where: {
  //             id: {
  //               in: tags, // Verifica se os IDs das tags existem no banco
  //             },
  //           },
  //         });

  //         //console.log('findTags', findTags);

  //         // Verifica se o array está vazio
  //         if (findTags.length === 0) {
  //           throw new HttpException(`this tags: ${tags} not found`, 404);
  //         }

  //         const findAudience = await trxCampaing.audiences.findMany({
  //           where: {
  //             id: {
  //               in: idAudience, // Verifica se os IDs das tags existem no banco
  //             },
  //             organization_id: organization_id,
  //           },
  //         });
  //         //console.log('findAudience', findAudience);
  //         // Verifica se o array está vazio
  //         if (findAudience.length === 0) {
  //           throw new HttpException(
  //             `this audience: ${findAudience} not found`,
  //             404,
  //           );
  //         }

  //         //TODO DTO PARA CRIAR CAMPANHA
  //         const camp = await trxCampaing.campaigns.create({
  //           data: {
  //             name: name,
  //             message: message,
  //             typeMessage: typeMessage,
  //             idChannel: channelId,
  //             sendingBy: findChannel.type,
  //             statusId: statusId ? statusId : Number(1),
  //             dateStart: dataInicio,
  //             dateEnd: dataFim,
  //             priority: priority,
  //             jsonMeta: jsonMeta ? jsonMeta : undefined,
  //             subject: subject ? subject : undefined,
  //             createdBy: createdBy,
  //             organization_id: organization_id,
  //           },
  //         });
  //         //console.log('Campanha criada:', camp);
  //         // Rastrear IDs de contato únicos usando um Set
  //         const uniqueContactIds = new Set<number>();

  //         //TODO VERIFICA SE JÁ EXISTE UMA AUDIENCIA
  //         for (const audiencia of idAudience) {
  //           //console.log('audiencia', audiencia);
  //           const campAudi = await trxCampaing.campaignaudience.create({
  //             data: {
  //               idCampaign: camp.id,
  //               idAudience: audiencia,
  //               organization_id: organization_id,
  //             },
  //           });
  //           //  console.log('campAudi', campAudi);

  //           // preciso dos contatos da audincia para adicionar na campaigndetails
  //           const audContacts = await trxCampaing.audiencescontacts.findMany({
  //             where: {
  //               idAudience: audiencia,
  //               organization_id: organization_id,
  //             },
  //           });
  //           // console.log('audContacts', audContacts);

  //           // Adiciona contatos únicos ao Set
  //           audContacts.forEach((contact) => {
  //             uniqueContactIds.add(contact.idContact);
  //           });
  //         }

  //         //console.log('uniqueContactIds', uniqueContactIds);
  //         // Cria os dados para inserir no banco
  //         const associationTagsData = tags.map((tag) => ({
  //           idTag: tag, // Cada tag será inserida separadamente
  //           idCampaing: camp.id,
  //           organization_id: organization_id,
  //           createdBy: 1,
  //         }));
  //         // console.log('associationTagsData', associationTagsData);
  //         // Realiza o insert usando createMany
  //         const associationTags = await trxCampaing.associationtags.createMany({
  //           data: associationTagsData,
  //           skipDuplicates: true, // Opcional: evita duplicatas, caso já existam associações
  //         });
  //         // console.log('associationTags', associationTags);

  //         // Prepara os dados finais para inserir no campaigndetails
  //         const campaignDetailsData = Array.from(uniqueContactIds).map(
  //           (idContact) => ({
  //             idCampaign: camp.id,
  //             idContact,
  //             statusId: 1,
  //             organization_id: organization_id,
  //           }),
  //         );
  //         // console.log('campaignDetailsData', campaignDetailsData);

  //         // const campaignInterationData = Array.from(uniqueContactIds).map(
  //         //   (idContact) => ({
  //         //     details: camp,
  //         //     organization_id: organization_id,
  //         //     type: CampaignContantes.EVENT_TYPE_CAMPAING,
  //         //     source_id: CampaignContantes.SOURCE_ID_CAMPAING,
  //         //     event_id: CampaignContantes.EVENT_ID_CAMPAING,
  //         //     created_by: 1,
  //         //     customer_unified_Id: idContact,
  //         //     status_id: 17,
  //         //   }),
  //         // );
  //         // // console.log('campaignInterationData', campaignInterationData);
  //         // if (campaignInterationData.length > 0) {
  //         //   const insertedInterationCampaing =
  //         //     await trxCampaing.interaction.createMany({
  //         //       data: campaignInterationData,
  //         //       skipDuplicates: true,
  //         //     });
  //         // }

  //         if (campaignDetailsData.length > 0) {
  //           const insertedDetails =
  //             await trxCampaing.campaigndetails.createMany({
  //               data: campaignDetailsData,
  //               skipDuplicates: true,
  //             });
  //           // console.log('Inserted campaign details:', insertedDetails);
  //           // const insrtedInterationCampaing = await trxCampaing.interaction.
  //         }
  //         return {
  //           campaign: camp,
  //           audience: idAudience,
  //           qtdContact: campaignDetailsData.length,
  //         };
  //       },
  //       {
  //         maxWait: 5000,
  //         timeout: 500000,
  //         isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  //       },
  //     );
  //   } catch (error) {
  //     console.log(`erro ao criar a campanha`, error);
  //     throw new HttpException(error.message, error.status);
  //   }
  //   //return 'This action adds a new campaign';
  // }

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
              typeMessage: createCampaingDto.typeMessage,
              idChannel: createCampaingDto.channelId,
              sendingBy: findChannel.type,
              statusId: createCampaingDto.statusId
                ? createCampaingDto.statusId
                : Number(1),
              dateStart: dataInicio,
              dateEnd: dataFim,
              priority: createCampaingDto.priority,
              jsonMeta: createCampaingDto.jsonMeta
                ? createCampaingDto.jsonMeta
                : undefined,
              subject: createCampaingDto.subject
                ? createCampaingDto.subject
                : undefined,
              createdBy: createCampaingDto.createdBy,
              organization_id: createCampaingDto.organization_id,
            },
          });
          // console.log('Campanha criada:', camp);
          // Rastrear IDs de contato únicos usando um Set
          const uniqueContactIds = new Set<number>();

          //TODO VERIFICA SE JÁ EXISTE UMA AUDIENCIA
          for (const audiencia of findAudience) {
            //console.log('audiencia', audiencia);
            await trxCampaing.campaignaudience.create({
              data: {
                idCampaign: camp.id,
                idAudience: audiencia.id,
                organization_id: createCampaingDto.organization_id,
              },
            });
            //console.log('campAudi', campAudi);

            // preciso dos contatos da audincia para adicionar na campaigndetails
            const audContacts = await trxCampaing.audiencescontacts.findMany({
              where: {
                idAudience: audiencia.id,
                organization_id: createCampaingDto.organization_id,
              },
            });
            //console.log('audContacts', audContacts);

            // Adiciona contatos únicos ao Set
            audContacts.forEach((contact) => {
              uniqueContactIds.add(contact.idContact);
            });
          }

          //console.log('uniqueContactIds', uniqueContactIds);
          // Cria os dados para inserir no banco
          const associationTagsData = findTags.map((tag) => ({
            idTag: tag.id,
            idCampaing: camp.id,
            organization_id: createCampaingDto.organization_id,
            createdBy: 1,
          }));

          //console.log('associationTagsData', associationTagsData);
          // Realiza o insert usando createMany
          await trxCampaing.associationtags.createMany({
            data: associationTagsData,
            skipDuplicates: true, // Opcional: evita duplicatas, caso já existam associações
          });
          //console.log('associationTags', associationTags);

          // Prepara os dados finais para inserir no campaigndetails
          const campaignDetailsData = Array.from(uniqueContactIds).map(
            (idContact) => ({
              idCampaign: camp.id,
              idContact,
              statusId: 1,
              organization_id: createCampaingDto.organization_id,
            }),
          );
          //console.log('campaignDetailsData', campaignDetailsData);

          if (campaignDetailsData.length > 0) {
            await trxCampaing.campaigndetails.createMany({
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

  // async findAll(query: {
  //   page?: number;
  //   limit?: number;
  //   organization_id: string;
  //   name?: string;
  //   statusId?: number;
  //   createdBy?: number;
  // }) {
  //   const { page, limit, organization_id, name, statusId, createdBy } = query;
  //   const skip = (page - 1) * limit;

  //   const filters = {
  //     AND: [
  //       organization_id ? { organization_id: organization_id } : {},
  //       name ? { name: { contains: name } } : {},
  //       statusId ? { statusId: statusId } : {},
  //       createdBy ? { createdBy: createdBy } : {},
  //     ],
  //   };
  //   try {
  //     const [campaign, totalCampaigns] = await Promise.all([
  //       this.prisma.campaigns.findMany({
  //         skip,
  //         take: Number(limit),
  //         where: filters,
  //         include: {
  //           campaignstatus: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //           Associationtags: {
  //             include: {
  //               tags: true,
  //             },
  //           },
  //           campaignaudience: {
  //             include: {
  //               audiences: {
  //                 select: {
  //                   name: true,
  //                 },
  //               },
  //             },
  //           },
  //           campaigndetails: true,
  //         },
  //         orderBy: [
  //           { updatedAt: 'desc' },
  //           { priority: 'desc' },
  //           { statusId: 'asc' },
  //         ],
  //       }),
  //       this.prisma.audiences.count({ where: filters }),
  //       // this.prisma.campaigndetails.count({ where: { statusId: { in: CampaignContantes.QTD_CAMPAING_DETAILS_ENVIADO, }, }, })
  //     ]);
  //     return {
  //       data: campaign,
  //       totalCampaigns,
  //       //qtdMsgEnviadas:qtdMsgEnviadas,
  //       page: Number(page),
  //       limit: Number(limit),
  //       totalPages: Math.ceil(totalCampaigns / limit),
  //     };
  //   } catch (error) {
  //     console.log(`erro ao procurar campanha`, error);
  //     throw new HttpException(error.message, error.status);
  //   }
  // }

  async findAll(findCampaingDto: FindCampaignchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip = (findCampaingDto.page - 1) * findCampaingDto.limit;
      const limit = Number(findCampaingDto.limit) || 10;
      const page = Number(findCampaingDto.page) || 1;

      const filters = {
        AND: [
          findCampaingDto.id ? { id: findCampaingDto.id } : {},
          findCampaingDto.organization_id
            ? { organization_id: findCampaingDto.organization_id }
            : {},
          findCampaingDto.name
            ? { name: { contains: findCampaingDto.name } }
            : {},
          findCampaingDto.statusId
            ? { statusId: findCampaingDto.statusId }
            : {},
          findCampaingDto.createdBy
            ? { createdBy: findCampaingDto.createdBy }
            : {},
        ],
      };

      const data = await this.prisma.campaigns.findMany({
        where: {
          organization_id: findCampaingDto.organization_id,
          ...filters,
        },
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
        skip,
        take: Number(limit),
      });

      // const [campaign, totalCampaigns] = await Promise.all([
      //   this.prisma.campaigns.findMany({
      //     skip,
      //     take: Number(limit),
      //     where: filters,
      //     include: {
      //       campaignstatus: {
      //         select: {
      //           id: true,
      //           name: true,
      //         },
      //       },
      //       Associationtags: {
      //         include: {
      //           tags: true,
      //         },
      //       },
      //       campaignaudience: {
      //         include: {
      //           audiences: {
      //             select: {
      //               name: true,
      //             },
      //           },
      //         },
      //       },
      //       campaigndetails: true,
      //     },
      //     orderBy: [
      //       { updatedAt: 'desc' },
      //       { priority: 'desc' },
      //       { statusId: 'asc' },
      //     ],
      //   }),
      //   this.prisma.audiences.count({ where: filters }),
      //   // this.prisma.campaigndetails.count({ where: { statusId: { in: CampaignContantes.QTD_CAMPAING_DETAILS_ENVIADO, }, }, })
      // ]);
      // return {
      //   data: campaign,
      //   totalCampaigns,
      //   //qtdMsgEnviadas:qtdMsgEnviadas,
      //   page: Number(page),
      //   limit: Number(limit),
      //   totalPages: Math.ceil(totalCampaigns / limit),
      // };

      const total = await this.prisma.campaigns.count({
        where: {
          organization_id: findCampaingDto.organization_id,
          ...filters,
        },
      });

      const totalPages = Math.ceil(total / limit);
      return {
        data,
        pageInfo: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  // async findOne(id: number, organization_id: string) {
  //   //console.log(id,organization_id)
  //   try {
  //     const campanha = await this.prisma.campaigns.findFirst({
  //       where: {
  //         id: id,
  //         organization_id: organization_id,
  //       },
  //     });
  //     if (!campanha) {
  //       throw new HttpException('Campanha nao existe', 404);
  //     }
  //     return campanha;
  //   } catch (error) {
  //     console.log(`erro ao procurar id da campanha`, error);
  //     throw new HttpException(error.message, error.status);
  //   }
  //   //return `This action returns a #${id} campaign`;
  // }

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
      const page = Number(campaingDetailsDto.page) || 1;

      const campanha = await this.prisma.campaigndetails.findMany({
        where: {
          idCampaign: Number(campaingDetailsDto.id),
          organization_id: campaingDetailsDto.organization_id,
        },
        include: {
          CustomerUnified: true,
          campaigndetailsstatus: true,
        },
        // take: limit,
        // cursor: cursor ? { id: cursor } : undefined,
        // orderBy: {
        //   id: 'asc',
        // },
        skip,
        take: Number(limit),
      });
      //console.log('campanha', campanha);

      if (!campanha) {
        throw new HttpException('Campanha nao existe', 404);
      }

      //console.log('campanha', campanha);
      //console.log('log interaction', interactions);
      // const itemsOnPage = campanha.length;
      const total = await this.prisma.campaigndetails.count({
        where: {
          organization_id: campaingDetailsDto.organization_id,
          // idCampaign: Number(createCampaignDto.id),
        },
      });

      // const nextCursor =
      //   campanha.length === limit ? campanha[campanha.length - 1].id : null;

      // const totalPages = Math.ceil(total / limit);

      const data = campanha.map((item) => ({
        firstName: item.CustomerUnified.firstname,
        lastName: item.CustomerUnified.lastname,
        phone: item.CustomerUnified.phone,
        sender: item.sender,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        statusId: item.campaigndetailsstatus.name,
      }));

      const totalPages = Math.ceil(total / limit);
      return {
        data,
        pageInfo: {
          total,
          page,
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
      //console.log('createCampaignDto', campaingContactDto);
      // const limit = Number(campaingContactDto.limit) || 10;
      // const cursor = campaingContactDto.cursor
      //   ? Number(campaingContactDto.cursor)
      //   : undefined;
      const skip = (campaingContactDto.page - 1) * campaingContactDto.limit;
      const limit = Number(campaingContactDto.limit) || 10;
      const page = Number(campaingContactDto.page) || 1;

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
      const total = await this.prisma.campaignDetails.count({
        where: {
          organization_id: campaingContactDto.organization_id,
          contact_id: Number(campaingContactDto.customer_unified_id),
        },
      });

      // const nextCursor =
      //   campanha.length === limit ? campanha[campanha.length - 1].id : null;

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pageInfo: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar detalhes da campanha`, error);
      throw new HttpException(error.message, error.status);
    }
  }
}
