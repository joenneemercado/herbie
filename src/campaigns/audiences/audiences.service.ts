import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';

import { InteractionsService } from '@src/interactions/interactions.service';
import { FindSegmentAudienceSchema } from './dto/audience.segment.schema';
import { FindAudienceContactsSchema } from './dto/audience.contacts.schema';
import { UpdateAudienceSchema } from './dto/audience.schema';
import { FindAudienceStatuschema } from './dto/audience.status.schema';
@Injectable()
export class AudiencesService {
  jwtService: any;

  constructor(
    private prisma: PrismaService,
    private interaction: InteractionsService,
  ) {}

  //Todo create audience com validacao

  //TODO FIND ALL AUDIENCE
  async findAll(params: {
    page?: number;
    limit?: number;
    organization_id: string;
    name?: string;
    statusId?: number;
    createdBy?: number;
  }) {
    const { page, limit, organization_id, name, statusId, createdBy } = params;
    const skip = (page - 1) * limit;

    const filters = {
      AND: [
        organization_id ? { organization_id: organization_id } : {},
        name ? { name: { contains: name } } : {},
        statusId ? { status_id: statusId } : {},
        createdBy ? { created_by: createdBy } : {},
      ],
    };
    try {
      const [audiences, total] = await Promise.all([
        this.prisma.audiences.findMany({
          select: {
            id: true,
            name: true,
            created_by: true,
            updated_by: true,
            created_at: true,
            updated_at: true,
            obs: true,
            AudienceStatus: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                AudiencesContacts: true,
              },
            },
          },
          skip,
          take: Number(limit),
          where: filters,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.audiences.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: audiences,
        //total,
        // page: Number(page),
        // limit: Number(limit),
        // totalPages: Math.ceil(total / limit),
        pageInfo: {
          totalItems: total,
          currentPage: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
        },
      };
    } catch (error) {
      console.log(`erro ao procurar audiência`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  //TODO CRIA AUDIENCIA SEGMENTADA COM BASE NOS FILTROS DE CUSTOMER UNIFIED E INTERATION
  async createAudienceSegment(
    findSegmentAudienceDto: FindSegmentAudienceSchema,
    req: Request,
    nolimit = true,
  ) {
    //console.log('CREATE AUDIENCE', findSegmentAudienceDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const findAudience = await this.prisma.audiences.findFirst({
        where: {
          name: findSegmentAudienceDto.name,
          organization_id: findSegmentAudienceDto.organization_id,
        },
      });
      if (findAudience) {
        return {
          message: 'Audiência já existe',
        };
      }

      const customers = await this.findAllSegmentedInteration(
        findSegmentAudienceDto,
        req,
        nolimit,
      );
      //console.log('Clientes para a audiência:', customers);
      const idCustomerUnified = customers.mergedCustomers.map(
        (customer) => customer.id,
      );
      //console.log('idCustomerUnified', idCustomerUnified);
      //const quantidadeRetornada = customers.mergedCustomers.length;
      //console.log('Quantidade de clientes nesta página:', quantidadeRetornada);

      const audience = await this.prisma.audiences.create({
        data: {
          name: findSegmentAudienceDto.name,
          organization_id: findSegmentAudienceDto.organization_id,
          status_id: 1,
          created_by: 1,
        },
      });

      await this.prisma.audiencesContacts.createMany({
        data: idCustomerUnified.map((idContact) => ({
          organization_id: findSegmentAudienceDto.organization_id,
          contact_id: idContact,
          audience_id: audience.id,
          created_by: 1,
          status_id: 1,
        })),
        skipDuplicates: true,
      });
      return {
        audience,
        contatcs: idCustomerUnified.length,
      };
    } catch (error) {}
  }

  //TODO FIND ALL CONTACTS OF CUSTOMER UNIFIED
  async findAllSegmented(params: {
    page?: number;
    limit?: number;
    organization_id: string;
    date_birth_start?: string[] | string;
    date_birth_end?: string[] | string;
    gender?: string;
    marital_status?: string;
    date_created_start?: string;
    date_created_end?: string;
  }) {
    const {
      page,
      limit,
      organization_id,
      date_birth_start,
      date_birth_end,
      gender,
      marital_status,
      date_created_start,
      date_created_end,
    } = params;
    //console.log(params)
    const skip = (page - 1) * limit;

    const startOfDay = new Date(date_created_start);
    startOfDay.setHours(0, 0, 0, 0); // Define para meia-noite do início do dia
    const endOfDay = new Date(date_created_end);
    endOfDay.setHours(23, 59, 59, 999); // Define para o final do dia

    //data_aniversario_inicio = [01-01 - 2000, 01-03 - 2000]
    //data_aniversario_fim = [31-01 - 2000, 31-03 - 2000]

    // let dateBirthFilter = { OR: [] };

    // if (date_birth_start) {
    //   const dates = Array.isArray(date_birth_start) ? date_birth_start : date_birth_start.replace(/[^\d, -]/g, '').split(',');
    //   console.log('dates1',dates)
    //   dates.forEach(date => {
    //     const parsedDate = new Date(date.trim());
    //     if (!isNaN(parsedDate.getTime())) {
    //       dateBirthFilter.OR.push(
    //         dates.length === 2
    //           ? { date_birth: { gte: new Date(dates[0].trim()), lte: new Date(dates[1].trim()) } }
    //           : { date_birth: parsedDate }
    //       );
    //     }
    //   });
    // }

    // if (date_birth_end) {
    //   const datesEnd = Array.isArray(date_birth_end) ? date_birth_end : date_birth_end.replace(/[^\d, -]/g, '').split(',');
    //   console.log('datesEnd',datesEnd)
    //   datesEnd.forEach(date => {
    //     const parsedDate = new Date(date.trim());
    //     if (!isNaN(parsedDate.getTime())) {
    //       dateBirthFilter.OR.push(
    //         datesEnd.length === 2
    //           ? { date_birth: { gte: new Date(datesEnd[0].trim()), lte: new Date(datesEnd[1].trim()) } }
    //           : { date_birth: parsedDate }
    //       );
    //     }
    //   });
    // }

    const dateBirthFilter = { OR: [] };

    // Garantindo que os inputs sejam arrays ou lidando com undefined
    const dates1 = date_birth_start
      ? Array.isArray(date_birth_start)
        ? date_birth_start
        : date_birth_start.replace(/[^\d, -]/g, '').split(',')
      : []; // Caso date_birth_start seja undefined, retorna um array vazio

    const datesEnd = date_birth_end
      ? Array.isArray(date_birth_end)
        ? date_birth_end
        : date_birth_end.replace(/[^\d, -]/g, '').split(',')
      : []; // Caso date_birth_end seja undefined, retorna um array vazio

    // console.log('dates1 (start dates):', dates1); // Verifique o array processado de start dates
    // console.log('datesEnd (end dates):', datesEnd); // Verifique o array processado de end dates

    // Iterando simultaneamente sobre os arrays
    for (let i = 0; i < Math.min(dates1.length, datesEnd.length); i++) {
      const startDate = new Date(dates1[i].trim());
      const endDate = new Date(datesEnd[i].trim());

      //console.log(`Processing pair [${i}]:`);
      // console.log(`  startDate: ${dates1[i]} -> Parsed: ${startDate}`);
      // console.log(`  endDate: ${datesEnd[i]} -> Parsed: ${endDate}`);

      // Adicionando apenas intervalos válidos ao filtro
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        dateBirthFilter.OR.push({
          date_birth: { gte: startDate, lte: endDate },
        });

        // console.log('  Valid pair added to filter:', {
        //   date_birth: { gte: startDate, lte: endDate },
        // });
      } else {
        console.log(' Invalid date pair, skipped.');
      }
    }

    // Resultado final do filtro
    // console.log('Final dateBirthFilter:', JSON.stringify(dateBirthFilter, null, 2));

    const filters = {
      AND: [
        organization_id ? { organization_id: organization_id } : {},
        //date_birth ? { date_birth: String(date_birth) } : {},
        gender ? { gender: String(gender) } : {},
        marital_status ? { marital_status: String(marital_status) } : {},
        date_created_start && date_created_end
          ? { created_at: { gte: startOfDay, lte: endOfDay } }
          : {},
        dateBirthFilter.OR.length > 0 ? dateBirthFilter : {}, // Apenas adiciona o filtro de data se houver
      ],
    };
    // console.log(filters)
    // console.log('Filters:', JSON.stringify(filters, null, 2));
    try {
      const [customerUnified, total] = await Promise.all([
        this.prisma.customerUnified.findMany({
          skip,
          take: Number(limit),
          where: filters,
          include: {
            Interaction: {
              where: {
                event_id: 6,
              },
            },
          },
          // where: {
          //   organization_id: organization_id,
          // date_birth: {
          //   Or: [
          //     {
          //       gte: new Date("01-01-2000"),
          //       lte: new Date("01-03-2000"),
          //     },
          //     {
          //       gte: new Date("31-01-2000"),
          //       lte: new Date("31-03-2000"),
          //     }
          //   ]
          // }
          // }
        }),
        this.prisma.customerUnified.count({ where: filters }),
      ]);

      return {
        data: customerUnified,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(`erro ao procurar audiência segmentada`, error);
      throw new HttpException(error.message, error.status);
    }

    //return `This action returns all audiences`;
  }

  //TODO: AJUSTADO COM OS FILTROS (DEIXAR ESSE)
  // async findAllSegmentedInteration(
  //   findSegmentAudienceDto: FindSegmentAudienceSchema,
  //   req: Request,
  //   nolimit = false,
  // ) {
  //   //console.log('findSegmentAudienceDto', findSegmentAudienceDto);
  //   const reqToken = req.headers['authorization'];
  //   if (!reqToken) {
  //     throw new UnauthorizedException();
  //   }
  //   try {
  //     const skip =
  //       (findSegmentAudienceDto.page - 1) * findSegmentAudienceDto.limit;
  //     const limit = Number(findSegmentAudienceDto.limit) || 10;
  //     const page = Number(findSegmentAudienceDto.page) || 1;

  //     const dateBirthFilter = { OR: [] };

  //     // Garantindo que os inputs sejam arrays ou lidando com undefined
  //     const dates1 = findSegmentAudienceDto.date_birth_start
  //       ? Array.isArray(findSegmentAudienceDto.date_birth_start)
  //         ? findSegmentAudienceDto.date_birth_start
  //         : findSegmentAudienceDto.date_birth_start
  //             .replace(/[^\d, -]/g, '')
  //             .split(',')
  //       : []; // Caso date_birth_start seja undefined, retorna um array vazio

  //     const datesEnd = findSegmentAudienceDto.date_birth_end
  //       ? Array.isArray(findSegmentAudienceDto.date_birth_end)
  //         ? findSegmentAudienceDto.date_birth_end
  //         : findSegmentAudienceDto.date_birth_end
  //             .replace(/[^\d, -]/g, '')
  //             .split(',')
  //       : []; // Caso date_birth_end seja undefined, retorna um array vazio

  //     const cleanDate = (d: string) => d.replace(/[\[\]\s]/g, '');

  //     for (let i = 0; i < Math.min(dates1.length, datesEnd.length); i++) {
  //       const startDate = new Date(cleanDate(dates1[i]));
  //       const endDate = new Date(cleanDate(datesEnd[i]));

  //       // console.log(`Processing pair [${i}]:`);
  //       // console.log(`  startDate: ${dates1[i]} -> Parsed: ${startDate}`);
  //       // console.log(`  endDate: ${datesEnd[i]} -> Parsed: ${endDate}`);

  //       if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
  //         dateBirthFilter.OR.push({
  //           date_birth: { gte: startDate, lte: endDate },
  //         });

  //         // console.log('  Valid pair added to filter:', {
  //         //   date_birth: { gte: startDate, lte: endDate },
  //         // });
  //       } else {
  //         console.log('Invalid date pair, skipped.');
  //       }
  //     }

  //     const filterCustomerInteration = [];

  //     if (
  //       findSegmentAudienceDto.sellerName &&
  //       findSegmentAudienceDto.sellerName.trim().length > 0
  //     ) {
  //       filterCustomerInteration.push({
  //         details: {
  //           path: ['hostname'],
  //           equals: findSegmentAudienceDto.sellerName.trim(),
  //         },
  //       });
  //     }

  //     if (
  //       Array.isArray(findSegmentAudienceDto.refId) &&
  //       findSegmentAudienceDto.refId.filter((r) => r.trim() !== '').length > 0
  //     ) {
  //       const refIdConditions = findSegmentAudienceDto.refId
  //         .filter((r) => r.trim() !== '')
  //         .flatMap((refId) => [
  //           {
  //             details: {
  //               path: ['items'],
  //               array_contains: [{ refId }],
  //             },
  //           },
  //           {
  //             details: {
  //               path: ['details', 'produtos'],
  //               array_contains: [{ codigo: refId }],
  //             },
  //           },
  //         ]);

  //       filterCustomerInteration.push({ OR: refIdConditions });
  //     }

  //     // Filtro para source_id
  //     if (
  //       Array.isArray(findSegmentAudienceDto.souce_id) &&
  //       findSegmentAudienceDto.souce_id.filter(
  //         (id) => id !== '' && !isNaN(Number(id)),
  //       ).length > 0
  //     ) {
  //       filterCustomerInteration.push({
  //         source_id: {
  //           in: findSegmentAudienceDto.souce_id
  //             .filter((id) => id !== '' && !isNaN(Number(id)))
  //             .map(Number),
  //         },
  //       });
  //     }

  //     // Filtro para event_id
  //     if (
  //       Array.isArray(findSegmentAudienceDto.event_id) &&
  //       findSegmentAudienceDto.event_id.filter(
  //         (id) => id !== '' && !isNaN(Number(id)),
  //       ).length > 0
  //     ) {
  //       filterCustomerInteration.push({
  //         event_id: {
  //           in: findSegmentAudienceDto.event_id
  //             .filter((id) => id !== '' && !isNaN(Number(id)))
  //             .map(Number),
  //         },
  //       });
  //     }

  //     if (
  //       (typeof findSegmentAudienceDto.total_start === 'number' &&
  //         findSegmentAudienceDto.total_start > 0) ||
  //       (typeof findSegmentAudienceDto.total_end === 'number' &&
  //         findSegmentAudienceDto.total_end > 0)
  //     ) {
  //       filterCustomerInteration.push({
  //         total: {
  //           gte: findSegmentAudienceDto.total_start,
  //           lte: findSegmentAudienceDto.total_end,
  //         },
  //       });
  //     }

  //     const filterCustomer = [];

  //     if (
  //       Array.isArray(findSegmentAudienceDto.gender) &&
  //       findSegmentAudienceDto.gender.filter((g) => g.trim() !== '').length > 0
  //     ) {
  //       const genderConditions = findSegmentAudienceDto.gender
  //         .filter((g) => g.trim() !== '')
  //         .map((gender) => ({
  //           gender,
  //         }));

  //       filterCustomer.push({
  //         OR: genderConditions,
  //       });
  //     }

  //     if (
  //       Array.isArray(findSegmentAudienceDto.marital_status) &&
  //       findSegmentAudienceDto.marital_status.filter((m) => m.trim() !== '')
  //         .length > 0
  //     ) {
  //       const maritalConditions = findSegmentAudienceDto.marital_status
  //         .filter((m) => m.trim() !== '')
  //         .map((marital_status) => ({
  //           marital_status,
  //         }));

  //       filterCustomer.push({
  //         OR: maritalConditions,
  //       });
  //     }

  //     const whereConditionCustomer = {
  //       AND: [
  //         ...filterCustomer,
  //         ...(dateBirthFilter.OR.length > 0
  //           ? [{ OR: dateBirthFilter.OR }]
  //           : []),
  //       ],
  //     };

  //     const whereConditionCustomerInteration = {
  //       AND: [...filterCustomerInteration],
  //     };

  //     // console.log(JSON.stringify(whereConditionCustomer));
  //     // console.log(JSON.stringify(whereConditionCustomerInteration));

  //     const data = await this.prisma.customerUnified.findMany({
  //       where: {
  //         organization_id: findSegmentAudienceDto.organization_id,
  //         status_id: 1, // cliente que ta unificado 100% sem conflito
  //         ...whereConditionCustomer,
  //         Interaction: {
  //           some: {
  //             ...whereConditionCustomerInteration,
  //           },
  //         },
  //       },
  //       select: {
  //         id: true,
  //         firstname: true,
  //         lastname: true,
  //         email: true,
  //         phone: true,
  //         date_birth: true,
  //         gender: true,
  //         marital_status: true,
  //         created_at: true,
  //         Interaction: {
  //           where: {
  //             ...whereConditionCustomerInteration,
  //           },
  //           select: {
  //             id: true,
  //             type: true,
  //             total: true,
  //             created_at: true,
  //             Source: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //             event: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       skip,
  //       take: nolimit ? undefined : Number(limit),
  //     });

  //     const total = await this.prisma.customerUnified.count({
  //       where: {
  //         organization_id: findSegmentAudienceDto.organization_id,
  //         status_id: 1, // cliente que ta unificado 100% sem conflito
  //         ...whereConditionCustomer,
  //         Interaction: {
  //           some: {
  //             ...whereConditionCustomerInteration,
  //           },
  //         },
  //       },
  //     });
  //     // console.log('Total tabela de customer', total);
  //     const totalPages = Math.ceil(total / limit);
  //     //console.log(findCustomer);

  //     return {
  //       data,
  //       pageInfo: {
  //         total,
  //         page,
  //         limit,
  //         totalPages,
  //       },
  //     };
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  //TODO: CODIGO AJUSTADO PARA PROCURAR NAS DUAS TABELAS DE INTERACAO E CUSTOMER
  async findAllSegmentedInteration(
    findSegmentAudienceDto: FindSegmentAudienceSchema,
    req: Request,
    nolimit = false,
  ) {
    //console.log('findSegmentAudienceDto', findSegmentAudienceDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip =
        (findSegmentAudienceDto.page - 1) * findSegmentAudienceDto.limit;
      const limit = Number(findSegmentAudienceDto.limit) || 10;
      const page = Number(findSegmentAudienceDto.page) || 1;

      const dateBirthFilter = { OR: [] };

      // Garantindo que os inputs sejam arrays ou lidando com undefined
      const dates1 = findSegmentAudienceDto.date_birth_start
        ? Array.isArray(findSegmentAudienceDto.date_birth_start)
          ? findSegmentAudienceDto.date_birth_start
          : findSegmentAudienceDto.date_birth_start
              .replace(/[^\d, -]/g, '')
              .split(',')
        : []; // Caso date_birth_start seja undefined, retorna um array vazio

      const datesEnd = findSegmentAudienceDto.date_birth_end
        ? Array.isArray(findSegmentAudienceDto.date_birth_end)
          ? findSegmentAudienceDto.date_birth_end
          : findSegmentAudienceDto.date_birth_end
              .replace(/[^\d, -]/g, '')
              .split(',')
        : []; // Caso date_birth_end seja undefined, retorna um array vazio

      const cleanDate = (d: string) => d.replace(/[\[\]\s]/g, '');

      for (let i = 0; i < Math.min(dates1.length, datesEnd.length); i++) {
        const startDate = new Date(cleanDate(dates1[i]));
        const endDate = new Date(cleanDate(datesEnd[i]));

        // console.log(`Processing pair [${i}]:`);
        // console.log(`  startDate: ${dates1[i]} -> Parsed: ${startDate}`);
        // console.log(`  endDate: ${datesEnd[i]} -> Parsed: ${endDate}`);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          dateBirthFilter.OR.push({
            date_birth: { gte: startDate, lte: endDate },
          });

          // console.log('  Valid pair added to filter:', {
          //   date_birth: { gte: startDate, lte: endDate },
          // });
        }
        // else {
        //console.log('Invalid date pair, skipped.');
        // }
      }

      const filterCustomerInteration = [];

      if (
        findSegmentAudienceDto.sellerName &&
        findSegmentAudienceDto.sellerName.trim().length > 0
      ) {
        filterCustomerInteration.push({
          details: {
            path: ['hostname'],
            equals: findSegmentAudienceDto.sellerName.trim(),
          },
        });
      }

      if (
        Array.isArray(findSegmentAudienceDto.refId) &&
        findSegmentAudienceDto.refId.filter((r) => r.trim() !== '').length > 0
      ) {
        const refIdConditions = findSegmentAudienceDto.refId
          .filter((r) => r.trim() !== '')
          .flatMap((refId) => [
            {
              details: {
                path: ['items'],
                array_contains: [{ refId }],
              },
            },
            {
              details: {
                path: ['details', 'produtos'],
                array_contains: [{ codigo: refId }],
              },
            },
          ]);

        filterCustomerInteration.push({ OR: refIdConditions });
      }

      // Filtro para source_id
      if (
        Array.isArray(findSegmentAudienceDto.souce_id) &&
        findSegmentAudienceDto.souce_id.filter(
          (id) => id !== '' && !isNaN(Number(id)),
        ).length > 0
      ) {
        filterCustomerInteration.push({
          source_id: {
            in: findSegmentAudienceDto.souce_id
              .filter((id) => id !== '' && !isNaN(Number(id)))
              .map(Number),
          },
        });
      }

      // Filtro para event_id
      if (
        Array.isArray(findSegmentAudienceDto.event_id) &&
        findSegmentAudienceDto.event_id.filter(
          (id) => id !== '' && !isNaN(Number(id)),
        ).length > 0
      ) {
        filterCustomerInteration.push({
          event_id: {
            in: findSegmentAudienceDto.event_id
              .filter((id) => id !== '' && !isNaN(Number(id)))
              .map(Number),
          },
        });
      }

      if (
        (typeof findSegmentAudienceDto.total_start === 'number' &&
          findSegmentAudienceDto.total_start > 0) ||
        (typeof findSegmentAudienceDto.total_end === 'number' &&
          findSegmentAudienceDto.total_end > 0)
      ) {
        filterCustomerInteration.push({
          total: {
            gte: findSegmentAudienceDto.total_start,
            lte: findSegmentAudienceDto.total_end,
          },
        });
      }

      const filterCustomer = [];

      if (
        Array.isArray(findSegmentAudienceDto.gender) &&
        findSegmentAudienceDto.gender.filter((g) => g.trim() !== '').length > 0
      ) {
        const genderConditions = findSegmentAudienceDto.gender
          .filter((g) => g.trim() !== '')
          .map((gender) => ({
            gender,
          }));

        filterCustomer.push({
          OR: genderConditions,
        });
      }

      if (
        Array.isArray(findSegmentAudienceDto.marital_status) &&
        findSegmentAudienceDto.marital_status.filter((m) => m.trim() !== '')
          .length > 0
      ) {
        const maritalConditions = findSegmentAudienceDto.marital_status
          .filter((m) => m.trim() !== '')
          .map((marital_status) => ({
            marital_status,
          }));

        filterCustomer.push({
          OR: maritalConditions,
        });
      }

      const whereConditionCustomer = {
        AND: [
          ...filterCustomer,
          ...(dateBirthFilter.OR.length > 0
            ? [{ OR: dateBirthFilter.OR }]
            : []),
        ],
      };

      const whereConditionCustomerInteration = {
        AND: [...filterCustomerInteration],
      };
      // console.log(JSON.stringify(whereConditionCustomer));
      // console.log(JSON.stringify(whereConditionCustomerInteration));
      try {
        let findCustomerUnified = [];
        //const countCustomerUnified = 0;

        let findInteration = [];
        // const countInteration = 0;

        let mergedUniqueCustomers = [];

        if (whereConditionCustomer.AND.length > 0) {
          findCustomerUnified = await this.prisma.customerUnified.findMany({
            where: {
              organization_id: findSegmentAudienceDto.organization_id,
              status_id: 1,
              ...whereConditionCustomer,
            },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              date_birth: true,
              gender: true,
              marital_status: true,
              created_at: true,
            },
            skip,
            take: nolimit ? undefined : Number(limit),
          });
          // countCustomerUnified = await this.prisma.customerUnified.count({
          //   where: {
          //     organization_id: findSegmentAudienceDto.organization_id,
          //     status_id: 1,
          //     ...whereConditionCustomer,
          //   },
          // });

          // console.log('countCustomerUnified', countCustomerUnified);
        }

        if (whereConditionCustomerInteration.AND.length > 0) {
          findInteration = await this.prisma.interaction.findMany({
            where: {
              NOT: {
                customer_unified_id: null,
              },
              organization_id: findSegmentAudienceDto.organization_id,
              ...whereConditionCustomerInteration,
              CustomerUnified: {
                status_id: 1,
              },
            },
            select: {
              CustomerUnified: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  phone: true,
                  date_birth: true,
                  gender: true,
                  marital_status: true,
                  created_at: true,
                },
              },
            },
            skip,
            take: nolimit ? undefined : Number(limit),
          });
          //console.log('findInteration', findInteration);

          const interationCustomers = findInteration
            .map((i) => i.CustomerUnified)
            .filter(Boolean);

          const allCustomers = [...findCustomerUnified, ...interationCustomers];

          mergedUniqueCustomers = Array.from(
            new Map(allCustomers.map((c) => [c.id, c])).values(),
          );

          // countInteration = await this.prisma.interaction.count({
          //   where: {
          //     NOT: {
          //       customer_unified_id: null,
          //     },
          //     organization_id: findSegmentAudienceDto.organization_id,
          //     ...whereConditionCustomerInteration,
          //     CustomerUnified: {
          //       status_id: 1,
          //     },
          //   },
          // });

          // console.log('countInteration', countInteration);
        }

        const total = mergedUniqueCustomers.length;
        const totalPages = Math.ceil(total / limit);

        return {
          // findCustomerUnified,
          // findInteration,
          mergedCustomers: mergedUniqueCustomers,
          // countCustomerUnified,
          // countInteration,
          pageInfo: {
            total,
            page,
            limit,
            totalPages,
          },
        };
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw new Error(
          'Erro ao buscar dados de clientes unificados ou interações.',
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: CONTAGEM DE INTERACOES E CONTAGEM DE CUSTOMER UNIFIED(DEIXAR ESSE)
  async findAllSegmentedInterationCount(
    findSegmentAudienceDto: FindSegmentAudienceSchema,
    req: Request,
    nolimit = false,
  ) {
    //console.log('findSegmentAudienceDto', findSegmentAudienceDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const dateBirthFilter = { OR: [] };

      // Garantindo que os inputs sejam arrays ou lidando com undefined
      const dates1 = findSegmentAudienceDto.date_birth_start
        ? Array.isArray(findSegmentAudienceDto.date_birth_start)
          ? findSegmentAudienceDto.date_birth_start
          : findSegmentAudienceDto.date_birth_start
              .replace(/[^\d, -]/g, '')
              .split(',')
        : []; // Caso date_birth_start seja undefined, retorna um array vazio

      const datesEnd = findSegmentAudienceDto.date_birth_end
        ? Array.isArray(findSegmentAudienceDto.date_birth_end)
          ? findSegmentAudienceDto.date_birth_end
          : findSegmentAudienceDto.date_birth_end
              .replace(/[^\d, -]/g, '')
              .split(',')
        : []; // Caso date_birth_end seja undefined, retorna um array vazio

      const cleanDate = (d: string) => d.replace(/[\[\]\s]/g, '');

      for (let i = 0; i < Math.min(dates1.length, datesEnd.length); i++) {
        const startDate = new Date(cleanDate(dates1[i]));
        const endDate = new Date(cleanDate(datesEnd[i]));

        // console.log(`Processing pair [${i}]:`);
        // console.log(`  startDate: ${dates1[i]} -> Parsed: ${startDate}`);
        // console.log(`  endDate: ${datesEnd[i]} -> Parsed: ${endDate}`);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          dateBirthFilter.OR.push({
            date_birth: { gte: startDate, lte: endDate },
          });

          // console.log('  Valid pair added to filter:', {
          //   date_birth: { gte: startDate, lte: endDate },
          // });
        }
        // else {
        //console.log('Invalid date pair, skipped.');
        // }
      }

      const filterCustomerInteration = [];

      if (
        findSegmentAudienceDto.sellerName &&
        findSegmentAudienceDto.sellerName.trim().length > 0
      ) {
        filterCustomerInteration.push({
          details: {
            path: ['hostname'],
            equals: findSegmentAudienceDto.sellerName.trim(),
          },
        });
      }

      if (
        Array.isArray(findSegmentAudienceDto.refId) &&
        findSegmentAudienceDto.refId.filter((r) => r.trim() !== '').length > 0
      ) {
        const refIdConditions = findSegmentAudienceDto.refId
          .filter((r) => r.trim() !== '')
          .flatMap((refId) => [
            {
              details: {
                path: ['items'],
                array_contains: [{ refId }],
              },
            },
            {
              details: {
                path: ['details', 'produtos'],
                array_contains: [{ codigo: refId }],
              },
            },
          ]);

        filterCustomerInteration.push({ OR: refIdConditions });
      }

      // Filtro para source_id
      if (
        Array.isArray(findSegmentAudienceDto.souce_id) &&
        findSegmentAudienceDto.souce_id.filter(
          (id) => id !== '' && !isNaN(Number(id)),
        ).length > 0
      ) {
        filterCustomerInteration.push({
          source_id: {
            in: findSegmentAudienceDto.souce_id
              .filter((id) => id !== '' && !isNaN(Number(id)))
              .map(Number),
          },
        });
      }

      // Filtro para event_id
      if (
        Array.isArray(findSegmentAudienceDto.event_id) &&
        findSegmentAudienceDto.event_id.filter(
          (id) => id !== '' && !isNaN(Number(id)),
        ).length > 0
      ) {
        filterCustomerInteration.push({
          event_id: {
            in: findSegmentAudienceDto.event_id
              .filter((id) => id !== '' && !isNaN(Number(id)))
              .map(Number),
          },
        });
      }

      if (
        (typeof findSegmentAudienceDto.total_start === 'number' &&
          findSegmentAudienceDto.total_start > 0) ||
        (typeof findSegmentAudienceDto.total_end === 'number' &&
          findSegmentAudienceDto.total_end > 0)
      ) {
        filterCustomerInteration.push({
          total: {
            gte: findSegmentAudienceDto.total_start,
            lte: findSegmentAudienceDto.total_end,
          },
        });
      }

      const filterCustomer = [];

      if (
        Array.isArray(findSegmentAudienceDto.gender) &&
        findSegmentAudienceDto.gender.filter((g) => g.trim() !== '').length > 0
      ) {
        const genderConditions = findSegmentAudienceDto.gender
          .filter((g) => g.trim() !== '')
          .map((gender) => ({
            gender,
          }));

        filterCustomer.push({
          OR: genderConditions,
        });
      }

      if (
        Array.isArray(findSegmentAudienceDto.marital_status) &&
        findSegmentAudienceDto.marital_status.filter((m) => m.trim() !== '')
          .length > 0
      ) {
        const maritalConditions = findSegmentAudienceDto.marital_status
          .filter((m) => m.trim() !== '')
          .map((marital_status) => ({
            marital_status,
          }));

        filterCustomer.push({
          OR: maritalConditions,
        });
      }

      const whereConditionCustomer = {
        AND: [
          ...filterCustomer,
          ...(dateBirthFilter.OR.length > 0
            ? [{ OR: dateBirthFilter.OR }]
            : []),
        ],
      };

      const whereConditionCustomerInteration = {
        AND: [...filterCustomerInteration],
      };
      // console.log(JSON.stringify(whereConditionCustomer));
      // console.log(JSON.stringify(whereConditionCustomerInteration));
      try {
        let countCustomerUnified = 0;

        let countInteration = 0;

        const totalCustomerUnified = await this.prisma.customerUnified.count({
          where: {
            organization_id: findSegmentAudienceDto.organization_id,
            status_id: 1,
          },
        });

        if (whereConditionCustomer.AND.length > 0) {
          countCustomerUnified = await this.prisma.customerUnified.count({
            where: {
              organization_id: findSegmentAudienceDto.organization_id,
              status_id: 1,
              ...whereConditionCustomer,
            },
          });
        }

        if (whereConditionCustomerInteration.AND.length > 0) {
          countInteration = await this.prisma.interaction.count({
            where: {
              NOT: {
                customer_unified_id: null,
              },
              organization_id: findSegmentAudienceDto.organization_id,
              CustomerUnified: {
                status_id: 1,
              },
              ...whereConditionCustomerInteration,
            },
          });
        }

        const filters = countCustomerUnified + countInteration;
        //const totalPages = Math.ceil(total / limit);

        return {
          totalCustomerUnified,
          filters,
        };
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw new Error(
          'Erro ao buscar dados de clientes unificados ou interações.',
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  //TODO FIND ID AUDIENCE COM OS CONTATOS PAGINADO
  async findAudienceContacts(
    findSegmentAudienceDto: FindAudienceContactsSchema,
    req: Request,
  ) {
    console.log('findSegmentAudienceDto', findSegmentAudienceDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip =
        (findSegmentAudienceDto.page - 1) * findSegmentAudienceDto.limit;
      const limit = Number(findSegmentAudienceDto.limit) || 10;
      const currentPage = Number(findSegmentAudienceDto.page) || 1;
      //console.log(id,organization_id)
      const audience = await this.prisma.audiences.findFirst({
        where: {
          id: Number(findSegmentAudienceDto.id),
          organization_id: String(findSegmentAudienceDto.organization_id),
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
          obs: true,
          AudienceStatus: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              AudiencesContacts: true,
              CampaignAudience: true,
            },
          },
        },
      });
      //console.log(audience);
      if (!audience) {
        throw new HttpException('Audiência nao existe', 404);
      }
      const audiencesContacts = await this.prisma.audiencesContacts.findMany({
        include: {
          CustomerUnified: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
        where: {
          audience_id: Number(audience.id),
        },
        skip,
        take: Number(limit),
      });

      const totalItems = await this.prisma.audiencesContacts.count({
        where: {
          audience_id: Number(audience.id),
        },
      });
      const contacts = audiencesContacts.map((item) => item.CustomerUnified);
      //console.log(contacts);
      const totalPages = Math.ceil(totalItems / limit);
      return {
        audience,
        contacts,
        pageInfo: {
          totalItems,
          currentPage,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao procurar id da audiência`, error);
      throw new HttpException(error.message, error.status);
    }
    //return `This action returns a #${id} audience`;
  }

  //TODO FIND AUDIENCE STATUS
  async audienceStatus(
    findAudienceStatusDto: FindAudienceStatuschema,
    req: Request,
  ) {
    //console.log('findAudienceStatusDto', findAudienceStatusDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip =
        (findAudienceStatusDto.page - 1) * findAudienceStatusDto.limit;
      const limit = Number(findAudienceStatusDto.limit) || 10;
      const page = Number(findAudienceStatusDto.page) || 1;
      const filtersAudienceStatus = [];
      if (findAudienceStatusDto.id) {
        filtersAudienceStatus.push({
          id: findAudienceStatusDto.id,
        });
      }
      const whereConditionAudienceStatus = {
        AND: [...filtersAudienceStatus],
      };
      //console.log(JSON.stringify(whereConditionAudienceStatus));
      const data = await this.prisma.audienceStatus.findMany({
        where: {
          organization_id: findAudienceStatusDto.organization_id,
          ...whereConditionAudienceStatus,
        },
        select: {
          id: true,
          name: true,
        },
        skip: skip,
        take: limit,
      });
      const total = await this.prisma.audienceStatus.count({
        where: {
          organization_id: findAudienceStatusDto.organization_id,
          ...whereConditionAudienceStatus,
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
      console.log(`erro ao procurar audiência`, error);
      throw new HttpException(error.message, error.status);
    }
  }
  //TODO UPDATE AUDIENCE ID
  async updateAudienceSegment(
    updateAudienceDto: UpdateAudienceSchema,
    req: Request,
  ) {
    // console.log('updateAudienceDto', updateAudienceDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const findAudience = await this.prisma.audiences.findFirst({
        where: {
          id: updateAudienceDto.id,
          organization_id: updateAudienceDto.organization_id,
        },
      });
      if (!findAudience) {
        return {
          message: 'Audiência nao já existe',
        };
      }
      //console.log(findAudience);
      const audience = await this.prisma.audiences.update({
        where: {
          id: updateAudienceDto.id,
        },
        data: {
          status_id: updateAudienceDto.status_id,
        },
      });
      //console.log(audience);
      return {
        message: 'Audiência atualizada com sucesso',
        audience,
      };
    } catch (error) {
      console.log(`erro ao procurar id da audiência`, error);
      throw new HttpException(error.message, error.status);
    }
  }
}
