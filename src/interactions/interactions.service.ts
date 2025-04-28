import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

import {
  FindInteractionSchema,
  FindInteractionTeucardSchema,
} from './dto/interation.dto';
import {
  IntrationCustomerUnifiedDtoSchema,
  IntrationDtoSchema,
} from './dto/interaction-schema';
import { InteractionConstantes } from './interactions.constantes';

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    organization_id: string;
    customer_id?: number;
    customer_unified_id?: number;
    orderby?: 'asc' | 'desc'; // <-- AQUI TIPANDO CERTO
  }) {
    const {
      page,
      limit,
      organization_id,
      customer_id,
      customer_unified_id,
      orderby,
    } = params;
    const skip = (page - 1) * limit;
    // console.log(params);
    // console.log(orderby);

    const filters: Prisma.InteractionWhereInput = {
      AND: [
        customer_id ? { customer_id: customer_id } : {},
        customer_unified_id ? { customer_unified_Id: customer_unified_id } : {},
        organization_id
          ? { organization_id: organization_id }
          : { organization_id: organization_id },
      ],
    };
    //console.log(filters);

    const orderByClause = {
      created_at: orderby ?? 'desc', // se não passar, vira 'desc' automático
    };
    try {
      const [result, total] = await Promise.all([
        this.prisma.interaction.findMany({
          skip,
          take: Number(limit),
          where: filters,
          // orderBy: {
          //   created_at: 'desc',
          // },
          orderBy: orderByClause,
          include: {
            CustomerUnified: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
            Source: {
              select: {
                name: true,
              },
            },
          },
        }),
        this.prisma.interaction.count({ where: filters }),
      ]);

      //console.log(result);

      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching customers Unified:', error);
      throw error;
    }
  }

  // async findAll(intrationDto: IntrationDtoSchema, req: Request) {
  //   try {
  //     const reqToken = req.headers['authorization'];
  //     if (!reqToken) {
  //       throw new UnauthorizedException();
  //     }

  //     const filters = [];

  //     if (intrationDto.customer_unified_id) {
  //       filters.push({
  //         customer_unified_Id: Number(intrationDto.customer_unified_id),
  //       });
  //     }

  //     const whereCondition = filters.length > 0 ? { AND: filters } : {};

  //     const limit = Number(intrationDto.limit) || 10;
  //     const cursor = intrationDto.cursor
  //       ? Number(intrationDto.cursor)
  //       : undefined;

  //     const realLimit = limit + 1; // pega 1 a maisit + 1; // pega 1 a mais

  //     const data = await this.prisma.interaction.findMany({
  //       where: {
  //         organization_id: intrationDto.organization_id,
  //         ...whereCondition,
  //       },
  //       include: {
  //         CustomerUnified: {
  //           select: {
  //             firstname: true,
  //             lastname: true,
  //           },
  //         },
  //         Source: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //       take: realLimit,
  //       cursor: cursor ? { id: cursor } : undefined,
  //       skip: cursor ? 1 : 0, // <- ESSA LINHA
  //       orderBy: {
  //         id: 'asc',
  //       },
  //     });

  //     // const nextCursor =
  //     //   data.length === limit ? data[data.length - 1].id : null;
  //     // //Ajustar o nextCursor e o retorno

  //     // console.log('log interaction', interactions);
  //     let nextCursor: number | null = null;
  //     if (data.length === realLimit) {
  //       const nextItem = data.pop(); // tira o item extra
  //       nextCursor = nextItem!.id; // pega o id dele como próximo cursor
  //     }

  //     const itemsOnPage = data.length;
  //     const total = await this.prisma.interaction.count({
  //       where: {
  //         organization_id: intrationDto.organization_id,
  //         ...whereCondition,
  //       },
  //     });

  //     const totalPages = Math.ceil(total / limit);

  //     return {
  //       data, // Dados da consulta
  //       pageInfo: {
  //         total, // Total de itens no banco
  //         itemsOnPage, // Itens retornados na página atual
  //         nextCursor, // ID do próximo cursor
  //         totalPages, // Total de páginas
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error fetching customers Unified:', error);
  //     throw error;
  //   }
  // }

  findOne(id: number) {
    return `This action returns a #${id} interaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} interaction`;
  }

  async findInteraction(
    findInteraction: FindInteractionSchema,
    req: Request,
    nolimit = false,
  ) {
    //console.log('findInteraction', findInteraction);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException('Token not provided');
    }

    const startDate = findInteraction.dateBegin
      ? new Date(findInteraction.dateBegin)
      : null;
    const endDate = findInteraction.dateEnd
      ? new Date(findInteraction.dateEnd)
      : null;

    const startDateUTC = startDate
      ? new Date(
          Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
            0,
            0,
            0,
          ),
        )
      : null;

    const endDateUTC = endDate
      ? new Date(
          Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
            23,
            59,
            59,
          ),
        )
      : null;

    const filters = [];

    if (startDateUTC && endDateUTC) {
      filters.push({
        details: {
          path: ['creationDate'],
          gte: startDateUTC,
          lte: endDateUTC,
        },
      });
    }

    if (findInteraction.sellerName) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ seller: findInteraction.sellerName }],
        },
      });
    }

    if (findInteraction.ean) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ ean: findInteraction.ean }],
        },
      });
    }

    if (findInteraction.refId) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ refId: findInteraction.refId }],
        },
      });
    }

    if (findInteraction.status_order) {
      filters.push({
        details: {
          path: ['status'],
          equals: findInteraction.status_order,
        },
      });
    }

    const whereCondition = filters.length > 0 ? { AND: filters } : {};

    const limit = Number(findInteraction) || 10;
    const cursor = findInteraction.cursor
      ? Number(findInteraction.cursor)
      : undefined;

    // if (
    //   Number(findInteraction.souceId) ===
    //   Number(InteractionConstantes.SOURCE_ID_VTEX)
    // ) {
    // }

    const interactions = await this.prisma.interaction.findMany({
      where: {
        organization_id: findInteraction.organization_id,
        event_id: 6,
        source_id: 2,
        ...whereCondition,
        NOT: {
          customer_unified_Id: null,
        },
      },
      include: {
        CustomerUnified: true,
      },
      take: nolimit ? undefined : limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    });
    // console.log('log interaction', interactions);

    const itemsOnPage = interactions.length;

    const total = await this.prisma.interaction.count({
      where: {
        organization_id: findInteraction.organization_id,
        event_id: 6,
        source_id: 2,
        ...whereCondition,
      },
    });

    const nextCursor =
      interactions.length === limit
        ? interactions[interactions.length - 1].id
        : null;

    const totalPages = Math.ceil(total / limit);

    const customerUnified = interactions.map((item) => ({
      id: item.CustomerUnified.id,
      firstName: item.CustomerUnified.firstname,
      lastName: item.CustomerUnified.lastname,
      phone: item.CustomerUnified.phone,
      email: item.CustomerUnified.email,
      cpf: item.CustomerUnified.cpf,
      cnpj: item.CustomerUnified.cnpj,
      birthDate: item.CustomerUnified.date_birth,
      gender: item.CustomerUnified.gender,
      maritalStatus: item.CustomerUnified.marital_status,
      statusId: item.CustomerUnified.status_id,
    }));

    return {
      customerUnified, // Dados da consulta
      pagination: {
        total, // Total de itens no banco
        itemsOnPage, // Itens retornados na página atual
        nextCursor, // ID do próximo cursor
        totalPages, // Total de páginas
      },
    };
  }

  //todo cpodigo so evento 5
  async findInteractionTeuCard(
    findInteraction: FindInteractionTeucardSchema,
    req: Request,
  ) {
    //console.log(findInteraction);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException('Token not provided');
    }

    const startDate = findInteraction.dateBegin
      ? new Date(findInteraction.dateBegin)
      : null;
    const endDate = findInteraction.dateEnd
      ? new Date(findInteraction.dateEnd)
      : null;

    const startDateUTC = startDate
      ? new Date(
          Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
            0,
            0,
            0,
          ),
        )
      : null;

    const endDateUTC = endDate
      ? new Date(
          Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
            23,
            59,
            59,
          ),
        )
      : null;

    const filters = [];

    if (startDateUTC && endDateUTC) {
      filters.push({
        created_at: {
          gte: startDateUTC,
          lte: endDateUTC,
        },
      });
    }

    const whereCondition = filters.length > 0 ? { AND: filters } : {};

    const limit = Number(findInteraction.limit) || 10;
    const cursor = findInteraction.cursor
      ? Number(findInteraction.cursor)
      : undefined;

    const interactions = await this.prisma.interaction.findMany({
      where: {
        organization_id: findInteraction.organization_id,
        event_id: 5,
        source_id: 1,
        ...whereCondition,
      },
      include: {
        CustomerUnified: true,
      },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    });

    const itemsOnPage = interactions.length;

    const total = await this.prisma.interaction.count({
      where: {
        organization_id: findInteraction.organization_id,
        event_id: 5,
        source_id: 1,
        ...whereCondition,
      },
    });

    const nextCursor =
      interactions.length === limit
        ? interactions[interactions.length - 1].id
        : null;

    const totalPages = Math.ceil(total / limit);

    // Obter IDs de CustomerUnified e Customer
    const unifiedIds = interactions
      .map((i) => i.customer_unified_Id)
      .filter((id) => !!id);

    const customerIds = interactions
      .filter((i) => !i.customer_unified_Id && !!i.customer_id)
      .map((i) => i.customer_id);

    // 2. Buscar quem comprou (event_id = 6)
    const compraram: any[] = [];

    // Obtenha interações de compra em blocos
    for (let i = 0; i < unifiedIds.length; i += 10000) {
      const chunk = unifiedIds.slice(i, i + 10000);
      const res = await this.prisma.interaction.findMany({
        where: {
          event_id: 6,
          organization_id: findInteraction.organization_id,
          customer_unified_Id: { in: chunk },
        },
        select: { customer_unified_Id: true },
      });
      compraram.push(...res);
    }

    for (let i = 0; i < customerIds.length; i += 10000) {
      const chunk = customerIds.slice(i, i + 10000);
      const res = await this.prisma.interaction.findMany({
        where: {
          event_id: 6,
          organization_id: findInteraction.organization_id,
          customer_id: { in: chunk },
        },
        select: { customer_id: true },
      });
      compraram.push(...res);
    }

    const compraramUnifiedIds = new Set(
      compraram.map((i) => i.customer_unified_Id).filter(Boolean),
    );
    const compraramCustomerIds = new Set(
      compraram.map((i) => i.customer_id).filter(Boolean),
    );

    // 3. Filtrar os que não compraram
    const aprovadosSemCompra = interactions.filter((interaction) => {
      if (interaction.customer_unified_Id) {
        return !compraramUnifiedIds.has(interaction.customer_unified_Id);
      } else if (
        interaction.customer_id &&
        interaction.customer_unified_Id === null
      ) {
        return !compraramCustomerIds.has(interaction.customer_id);
      }
      return false;
    });

    // Filtra os objetos vazios antes de mapear os dados
    const customerUnified = aprovadosSemCompra
      .map((item) => ({
        id: item.CustomerUnified?.id,
        firstName: item.CustomerUnified?.firstname,
        lastName: item.CustomerUnified?.lastname,
        phone: item.CustomerUnified?.phone,
        email: item.CustomerUnified?.email,
        cpf: item.CustomerUnified?.cpf,
        cnpj: item.CustomerUnified?.cnpj,
        birthDate: item.CustomerUnified?.date_birth,
        gender: item.CustomerUnified?.gender,
        maritalStatus: item.CustomerUnified?.marital_status,
        statusId: item.CustomerUnified?.status_id,
      }))
      .filter((item) => item.id !== undefined); // Filtra objetos vazios

    // console.log('customerUnified', customerUnified);

    return {
      customerUnified, // Dados da consulta
      pagination: {
        total, // Total de itens no banco
        itemsOnPage, // Itens retornados na página atual
        nextCursor, // ID do próximo cursor
        totalPages, // Total de páginas
      },
    };
  }

  //todo interacao de campanha para o contato
  async findInteractionCampaingContact(
    intrationDto: IntrationDtoSchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const filters = [];

      const customer_unified_Tratato = intrationDto.customer_unified_id
        ? Number(intrationDto.customer_unified_id)
        : undefined;

      if (intrationDto.customer_unified_id) {
        filters.push({
          customer_unified_Id: customer_unified_Tratato,
        });
      }

      const whereCondition = filters.length > 0 ? { AND: filters } : {};

      const limit = Number(intrationDto.limit) || 10;
      const cursor = intrationDto.cursor
        ? Number(intrationDto.cursor)
        : undefined;

      //console.log(intrationDto);
      const interactions = await this.prisma.interaction.findMany({
        where: {
          organization_id: intrationDto.organization_id,
          event_id: InteractionConstantes.EVENTE_ID_CAMPAIGN,
          source_id: InteractionConstantes.SOURCE_ID_CAMPAIGN,
          type: InteractionConstantes.EVENT_TYPE_CAMPAIGN,
          ...whereCondition,
        },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'asc',
        },
      });
      //console.log('log interaction', interactions);
      const itemsOnPage = interactions.length;
      const total = await this.prisma.interaction.count({
        where: {
          organization_id: intrationDto.organization_id,
          event_id: InteractionConstantes.EVENTE_ID_CAMPAIGN,
          source_id: InteractionConstantes.SOURCE_ID_CAMPAIGN,
          type: InteractionConstantes.EVENT_TYPE_CAMPAIGN,
          ...whereCondition,
        },
      });

      const nextCursor =
        interactions.length === limit
          ? interactions[interactions.length - 1].id
          : null;

      const totalPages = Math.ceil(total / limit);

      // Extraindo múltiplos campos de 'details'
      const data = interactions
        .map((interaction) => {
          if (interaction.details && typeof interaction.details === 'object') {
            return {
              id: interaction.details['id'],
              name: interaction.details['name'],
              message: interaction.details['message'],
              dateStart: interaction.details['dateStart'],
              dateEnd: interaction.details['dateEnd'],
            };
          }
          return null; // Caso 'details' não seja um objeto válido
        })
        .filter(Boolean);

      //console.log('Detalhes das campanhas:', data);

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
      console.error('Error in findInteractionCampaing:', error);
      throw new InternalServerErrorException();
    }
  }

  //todo intracao do contato unificado
  async findInteractionCustomerUnified(
    interactionCustomerUnified: IntrationCustomerUnifiedDtoSchema,
    req: Request,
  ) {
    console.log('findInteractionCustomerUnified', interactionCustomerUnified);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const limit = Number(interactionCustomerUnified.limit) || 10;
      const cursor = interactionCustomerUnified.cursor
        ? Number(interactionCustomerUnified.cursor)
        : undefined;

      const data = await this.prisma.interaction.findMany({
        where: {
          organization_id: interactionCustomerUnified.organization_id,
          customer_unified_Id: interactionCustomerUnified.customer_unified_id,
          NOT: {
            customer_unified_Id: null,
          },
        },
        include: {
          CustomerUnified: true,
        },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'asc',
        },
      });
      const itemsOnPage = data.length;

      const nextCursor =
        data.length === limit ? data[data.length - 1].id : null;

      const total = await this.prisma.interaction.count({
        where: {
          organization_id: interactionCustomerUnified.organization_id,
          customer_unified_Id: interactionCustomerUnified.customer_unified_id,
          NOT: {
            customer_unified_Id: null,
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
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
      console.log('Error in findInteractionCustomerUnified:', error);
    }
  }
}
