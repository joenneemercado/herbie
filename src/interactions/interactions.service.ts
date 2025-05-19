import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { toZonedTime, format } from 'date-fns-tz';

import {} from './dto/interation.dto';
import {
  InteractionDtoSchema,
  IntrationCustomerUnifiedDtoSchema,
} from './dto/interaction-schema';

import { InteractionCompraSchema } from './dto/interation-compra-schema';
import { InteractionTeucardSchema } from './dto/interation-teucard.schema';

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //todo procura todas as interacoes para o contato
  async findAll(interation: InteractionDtoSchema, req: Request) {
    try {
      //console.log(interation);
      const reqToken = req.headers['authorization'];
      if (!reqToken) {
        throw new UnauthorizedException();
      }
      //console.log('findAll', intrationDto);
      const skip = (interation.page - 1) * interation.limit;
      const filters = [];

      if (interation.customer_unified_id) {
        filters.push({
          customer_unified_id: Number(interation.customer_unified_id),
        });
      }
      if (interation.customer_id) {
        filters.push({
          customer_id: Number(interation.customer_id),
        });
      }
      const orderdy = interation.orderby;

      const whereCondition = filters.length > 0 ? { AND: filters } : {};

      //console.log(whereCondition);

      const limit = Number(interation.limit) || 10;
      const page = Number(interation.page) || 1;

      const data = await this.prisma.interaction.findMany({
        where: {
          organization_id: interation.organization_id,
          ...whereCondition,
        },
        orderBy: {
          created_at: orderdy ?? 'desc', // se não passar, vira 'desc' automático
        },
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
        skip,
        take: Number(limit),
      });

      const total = await this.prisma.interaction.count({
        where: {
          organization_id: interation.organization_id,
          ...whereCondition,
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
      console.error('Error fetching customers Unified:', error);
      throw error;
    }
  }

  //todo interacao de compra vtex(ta chapado)
  async findInteraction(
    interation: InteractionCompraSchema,
    req: Request,
    nolimit = false,
  ) {
    //console.log('findInteraction', findInteraction);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException('Token not provided');
    }
    const skip = (interation.page - 1) * interation.limit;
    const limit = Number(interation.limit) || 10;
    const page = Number(interation.page) || 1;

    const startDate = interation.dateBegin
      ? new Date(interation.dateBegin)
      : null;
    const endDate = interation.dateEnd ? new Date(interation.dateEnd) : null;

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

    if (interation.sellerName) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ seller: interation.sellerName }],
        },
      });
    }

    if (interation.ean) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ ean: interation.ean }],
        },
      });
    }

    if (interation.refId) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ refId: interation.refId }],
        },
      });
    }

    if (interation.status_order) {
      filters.push({
        details: {
          path: ['status'],
          equals: interation.status_order,
        },
      });
    }

    const whereCondition = filters.length > 0 ? { AND: filters } : {};

    // const limit = Number(nolimit) || 10;
    // const cursor = interation.cursor ? Number(interation.cursor) : undefined;

    const interactions = await this.prisma.interaction.findMany({
      where: {
        organization_id: interation.organization_id,
        event_id: 6,
        source_id: 2,
        ...whereCondition,
        NOT: {
          customer_unified_id: null,
        },
      },
      include: {
        CustomerUnified: true,
      },
      // take: nolimit ? undefined : limit,
      // cursor: cursor ? { id: cursor } : undefined,
      // orderBy: {
      //   id: 'asc',
      // },
      skip,
      take: nolimit ? undefined : limit,
    });
    // console.log('log interaction', interactions);

    // const itemsOnPage = interactions.length;

    const total = await this.prisma.interaction.count({
      where: {
        organization_id: interation.organization_id,
        event_id: 6,
        source_id: 2,
        ...whereCondition,
      },
    });

    // const nextCursor =
    //   interactions.length === limit
    //     ? interactions[interactions.length - 1].id
    //     : null;

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
      // pagination: {
      //   total, // Total de itens no banco
      //   itemsOnPage, // Itens retornados na página atual
      //   nextCursor, // ID do próximo cursor
      //   totalPages, // Total de páginas
      // },
      pageInfo: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  //todo cpodigo so evento 5
  async findInteractionTeuCard(
    interation: InteractionTeucardSchema,
    req: Request,
  ) {
    //console.log(findInteraction);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException('Token not provided');
    }
    try {
      const skip = (interation.page - 1) * interation.limit;
      const limit = Number(interation.limit) || 10;
      const page = Number(interation.page) || 1;

      const startDate = interation.dateBegin
        ? new Date(interation.dateBegin)
        : null;
      const endDate = interation.dateEnd ? new Date(interation.dateEnd) : null;

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

      // const limit = Number(interation.limit) || 10;
      // const cursor = interation.cursor ? Number(interation.cursor) : undefined;

      const interactions = await this.prisma.interaction.findMany({
        where: {
          organization_id: interation.organization_id,
          event_id: 5,
          source_id: 1,
          ...whereCondition,
        },
        include: {
          CustomerUnified: true,
        },
        // take: limit,
        // cursor: cursor ? { id: cursor } : undefined,
        // orderBy: {
        //   id: 'asc',
        // },
        skip,
        take: Number(limit),
      });

      //const itemsOnPage = interactions.length;

      const total = await this.prisma.interaction.count({
        where: {
          organization_id: interation.organization_id,
          event_id: 5,
          source_id: 1,
          ...whereCondition,
        },
      });

      // const nextCursor =
      //   interactions.length === limit
      //     ? interactions[interactions.length - 1].id
      //     : null;

      const totalPages = Math.ceil(total / limit);

      // Obter IDs de CustomerUnified e Customer
      const unifiedIds = interactions
        .map((i) => i.customer_unified_id)
        .filter((id) => !!id);

      const customerIds = interactions
        .filter((i) => !i.customer_unified_id && !!i.customer_id)
        .map((i) => i.customer_id);

      // 2. Buscar quem comprou (event_id = 6)
      const compraram: any[] = [];

      // Obtenha interações de compra em blocos
      for (let i = 0; i < unifiedIds.length; i += 10000) {
        const chunk = unifiedIds.slice(i, i + 10000);
        const res = await this.prisma.interaction.findMany({
          where: {
            event_id: 6,
            organization_id: interation.organization_id,
            customer_unified_id: { in: chunk },
          },
          select: { customer_unified_id: true },
        });
        compraram.push(...res);
      }

      for (let i = 0; i < customerIds.length; i += 10000) {
        const chunk = customerIds.slice(i, i + 10000);
        const res = await this.prisma.interaction.findMany({
          where: {
            event_id: 6,
            organization_id: interation.organization_id,
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
        if (interaction.customer_unified_id) {
          return !compraramUnifiedIds.has(interaction.customer_unified_id);
        } else if (
          interaction.customer_id &&
          interaction.customer_unified_id === null
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
        // pagination: {
        //   total, // Total de itens no banco
        //   itemsOnPage, // Itens retornados na página atual
        //   nextCursor, // ID do próximo cursor
        //   totalPages, // Total de páginas
        // },
        pageInfo: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  //todo intracao do contato unificado
  async findInteractionCustomerUnified(
    interactionCustomerUnified: IntrationCustomerUnifiedDtoSchema,
    req: Request,
  ) {
    //console.log('findInteractionCustomerUnified', interactionCustomerUnified);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    try {
      // const limit = Number(interactionCustomerUnified.limit) || 10;
      // const cursor = interactionCustomerUnified.cursor
      //   ? Number(interactionCustomerUnified.cursor)
      //   : undefined;
      const skip =
        (interactionCustomerUnified.page - 1) *
        interactionCustomerUnified.limit;
      const limit = Number(interactionCustomerUnified.limit) || 10;
      const page = Number(interactionCustomerUnified.page) || 1;

      const data = await this.prisma.interaction.findMany({
        where: {
          organization_id: interactionCustomerUnified.organization_id,
          customer_unified_id: interactionCustomerUnified.customer_unified_id,
          NOT: {
            customer_unified_id: null,
          },
        },
        include: {
          CustomerUnified: true,
        },
        skip,
        take: Number(limit),
        // take: limit,
        // cursor: cursor ? { id: cursor } : undefined,
        // orderBy: {
        //   id: 'asc',
        // },
      });
      // const itemsOnPage = data.length;

      // const nextCursor =
      //   data.length === limit ? data[data.length - 1].id : null;

      const total = await this.prisma.interaction.count({
        where: {
          organization_id: interactionCustomerUnified.organization_id,
          customer_unified_id: interactionCustomerUnified.customer_unified_id,
          NOT: {
            customer_unified_id: null,
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      return {
        data, // Dados da consulta
        // pageInfo: {
        //   total, // Total de itens no banco
        //   itemsOnPage, // Itens retornados na página atual
        //   nextCursor, // ID do próximo cursor
        //   totalPages, // Total de páginas
        // },
        pageInfo: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log('Error in findInteractionCustomerUnified:', error);
    }
  }

  async getInteractionsByCustomerUnifiedId(
    customer_unified_id: number,
    tz?: string,
  ) {
    try {
      const interactionCustomerUnified =
        await this.prisma.interaction.findFirst({
          select: {
            type: true,
            total: true,
            created_at: true,
            Source: {
              select: {
                name: true,
              },
            },
            Seller: {
              select: {
                name: true,
                seller_ref: true,
              },
            },
          },
          where: {
            customer_unified_id,
          },
        });
      if (!interactionCustomerUnified) return null;

      // Converte a data se o timezone for informado
      if (tz && interactionCustomerUnified.created_at) {
        const zoned = toZonedTime(interactionCustomerUnified.created_at, tz);
        const formattedDate = format(zoned, 'yyyy-MM-dd HH:mm:ssXXX', {
          timeZone: tz,
        });

        return {
          ...interactionCustomerUnified,
          created_at: formattedDate, // Agora sim, é string e você controla
        };
      }

      return interactionCustomerUnified;
    } catch (error) {
      console.log('Error in getCustomerUnified:', error);
    }
  }
}
