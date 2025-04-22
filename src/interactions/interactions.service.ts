import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { InteractionConstantes } from './interactions.constantes';
import { CreateInteractionSchema } from './dto/create-interaction-schema';
import { FindInteractionSchema } from './dto/interation.dto';
import { last } from 'rxjs';

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createInteractionDto: CreateInteractionSchema, req: Request) {
    console.log('createInteractionDto', createInteractionDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, orgs } = await this.jwtService.decode(token);
      const {
        organization_id,
        cpf,
        event_id,
        //source_id,
        type,
        details,
        total,
      } = createInteractionDto;

      console.log(details);

      const findCustomerUnified = await this.prisma.customerUnified.findFirst({
        where: {
          cpf: cpf,
          organization_id: organization_id,
        },
      });

      const findUser = await this.prisma.customer.findFirst({
        where: {
          cpf: cpf,
          organization_id: organization_id,
          source_id: InteractionConstantes.SOURCE_ID_ZEUS,
        },
      });

      if (!findUser) {
        return {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
        //throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      if (findCustomerUnified && findUser) {
        await this.prisma.interaction.create({
          data: {
            organization_id: organization_id,
            details: details.length > 0 ? details : createInteractionDto,
            customer_unified_Id: findCustomerUnified.id,
            event_id: event_id,
            source_id: InteractionConstantes.SOURCE_ID_ZEUS,
            type: type,
            total: total,
          },
        });
        //console.log('criando com customer unified', createInteraction)
      } else {
        await this.prisma.interaction.create({
          data: {
            organization_id: organization_id,
            details: details.length > 0 ? details : createInteractionDto,
            customer_id: findUser.id,
            event_id: event_id,
            source_id: InteractionConstantes.SOURCE_ID_ZEUS,
            type: type,
            total: total,
          },
        });
        //console.log('cirando customer', createInteraction)
      }

      return {
        message: 'Interaction created successfully',
        code: HttpStatus.CREATED,
      };
    } catch (error) {
      console.log(error.message);
    }
    //return 'This action adds a new interaction';
  }

  async findAll(params: {
    page: number;
    limit: number;
    organization_id: string;
    customer_id?: number;
    customer_unified_id?: number;
  }) {
    const { page, limit, organization_id, customer_id, customer_unified_id } =
      params;
    const skip = (page - 1) * limit;

    const filters: Prisma.InteractionWhereInput = {
      AND: [
        customer_id ? { customer_id: customer_id } : {},
        customer_unified_id ? { customer_unified_Id: customer_unified_id } : {},
        organization_id
          ? { organization_id: organization_id }
          : { organization_id: organization_id },
      ],
    };

    try {
      const [result, total] = await Promise.all([
        this.prisma.interaction.findMany({
          skip,
          take: Number(limit),
          where: filters,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.interaction.count({ where: filters }),
      ]);

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

  findOne(id: number) {
    return `This action returns a #${id} interaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} interaction`;
  }

  // async findInteraction() {
  //   const find = await this.prisma.interaction.findMany({
  //     where: {
  //       event_id: 6,
  //       source_id: 2,
  //       AND: [
  //         // {
  //         //   details: {
  //         //     path: ['items'],
  //         //     array_contains: [{ refId: '193506' }],
  //         //   },
  //         // },
  //         // {
  //         //   details: {
  //         //     path: ['items'],
  //         //     array_contains: [{ ean: '7894900709926' }],
  //         //   },
  //         // },
  //         // {
  //         //   details: {
  //         //     path: ['items'],
  //         //     array_contains: [{ quantity: 8 }],
  //         //   },
  //         // },
  //         {
  //           details: {
  //             path: ['creationDate'],
  //             gte: '2025-03-30T00:00:00.000Z',
  //             lte: '2025-03-31T23:59:59.999Z',
  //           },
  //         },
  //         {
  //           details: {
  //             path: ['items'],
  //             array_contains: [{ seller: 'mercantilnovaeraloja10' }],
  //           },
  //         },
  //         {
  //           details: {
  //             path: ['status'],
  //             equals: 'invoiced',
  //           },
  //         },
  //       ],
  //     },
  //   });

  //   console.log(find);
  //   return find;
  // }

  async findInteraction(findInteraction: FindInteractionSchema, req: Request) {
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

    if (findInteraction.seller) {
      filters.push({
        details: {
          path: ['items'],
          array_contains: [{ seller: findInteraction.seller }],
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

    const limit = Number(findInteraction.limit) || 10;
    const cursor = findInteraction.cursor
      ? Number(findInteraction.cursor)
      : undefined;

    const interactions = await this.prisma.interaction.findMany({
      where: {
        organization_id: findInteraction.organization_id,
        event_id: 6,
        source_id: 2,
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

  // async findInteraction(
  //   seller: string,
  //   date_start: string,
  //   date_end: string,
  //   ean: string,
  // ) {
  //   // console.log(seller, date_start, date_end);
  //   // const result = await this.prisma.$queryRawUnsafe(`
  //   //   SELECT *
  //   //   FROM "herbie-novaera"."Interaction" i
  //   //   WHERE
  //   //      i.details->'items' @> '[{"seller": "${seller}"}]'
  //   //   AND (i.details->>'creationDate')::timestamp::date BETWEEN '${date_start}' AND '${date_end}'
  //   // `);
  //   // console.log(result);

  //   const whereClauses: string[] = [];

  //   // Se tiver seller, adiciona a cláusula
  //   if (seller) {
  //     whereClauses.push(`i.details->'items' @> '[{"seller": "${seller}"}]'`);
  //   }

  //   // Se tiver intervalo de data
  //   if (date_start && date_end) {
  //     whereClauses.push(
  //       `(i.details->>'creationDate')::timestamp::date BETWEEN '${date_start}' AND '${date_end}'`,
  //     );
  //   }
  //   if (ean) {
  //     whereClauses.push(`i.details->'items' @> '[{"ean": "${ean}"}]'`);
  //   }

  //   const where = whereClauses.length
  //     ? `WHERE ${whereClauses.join(' AND ')}`
  //     : '';

  //   const query = `
  //   SELECT *
  //   FROM "herbie-novaera"."Interaction" i
  //   ${where}
  // `;

  //   const result = await this.prisma.$queryRawUnsafe(query);

  //   return result;
  // }
}
