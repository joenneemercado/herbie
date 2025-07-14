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
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
@Injectable()
export class AudiencesService {
  jwtService: any;

  constructor(
    private prisma: PrismaService,
    private interaction: InteractionsService,
    @InjectQueue('audience-queue') private audienceQueue: Queue,
  ) {}

  //Todo create audience com validacao

  async addFileToQueue(
    filePath: string,
    fileType: 'csv' | 'xlsx',
    organization_id: string,
    audienceName: string,
  ): Promise<void> {
    try {
      await this.audienceQueue.add(
        'import-audience-file-queue',
        {
          filePath,
          fileType,
          organization_id,
          audienceName,
        },
        {
          attempts: 1,
          delay: 5000,
        },
      );

      //console.log('terminou');
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error.message;
    }
  }

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
      const idCustomerUnified = customers.findCustomerUnified.map(
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

      try {
        const finalSegmentWhere = await this.buildSegmentFilters(
          findSegmentAudienceDto,
        );

        // Remover skip/take da query, pois a paginação será feita manualmente após filtros de birth_day/birth_month
        const findCustomerUnified = await this.prisma.customerUnified.findMany({
          where: finalSegmentWhere,
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
        });

        // --- Filtro em memória para birth_day e birth_month ---
        let filteredCustomers = findCustomerUnified;

        if (
          Array.isArray(findSegmentAudienceDto.birth_day) &&
          findSegmentAudienceDto.birth_day.length > 0
        ) {
          const birthDays = findSegmentAudienceDto.birth_day.map(Number);
          filteredCustomers = filteredCustomers.filter((customer) => {
            const date = new Date(customer.date_birth);
            return birthDays.includes(date.getUTCDate());
          });
        }

        if (
          Array.isArray(findSegmentAudienceDto.birth_month) &&
          findSegmentAudienceDto.birth_month.length > 0
        ) {
          const birthMonths = findSegmentAudienceDto.birth_month.map(Number);
          filteredCustomers = filteredCustomers.filter((customer) => {
            const date = new Date(customer.date_birth);
            return birthMonths.includes(date.getUTCMonth() + 1);
          });
        }

        // Paginação manual após filtros em memória
        const paginated = nolimit
          ? filteredCustomers
          : filteredCustomers.slice(skip, skip + limit);
        const total = filteredCustomers.length;
        const totalPages = Math.ceil(total / limit);

        return {
          // findCustomerUnified,
          // findInteration,
          findCustomerUnified: paginated,
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

  async findAllSegmentedInterationCount(
    findSegmentAudienceDto: FindSegmentAudienceSchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    try {
      const finalSegmentWhere = await this.buildSegmentFilters(
        findSegmentAudienceDto,
      );
      // console.log('finalSegmentWhere', JSON.stringify(finalSegmentWhere));

      const allFiltered = await this.prisma.customerUnified.findMany({
        where: finalSegmentWhere,
        select: {
          id: true,
          date_birth: true,
        },
      });

      let filtered = allFiltered;

      if (
        Array.isArray(findSegmentAudienceDto.birth_day) &&
        findSegmentAudienceDto.birth_day.length > 0
      ) {
        const birthDays = findSegmentAudienceDto.birth_day.map(Number);
        filtered = filtered.filter((c) =>
          birthDays.includes(new Date(c.date_birth).getUTCDate()),
        );
      }

      if (
        Array.isArray(findSegmentAudienceDto.birth_month) &&
        findSegmentAudienceDto.birth_month.length > 0
      ) {
        const birthMonths = findSegmentAudienceDto.birth_month.map(Number);
        filtered = filtered.filter((c) =>
          birthMonths.includes(new Date(c.date_birth).getUTCMonth() + 1),
        );
      }

      const totalCustomerUnified = await this.prisma.customerUnified.count({
        where: {
          organization_id: findSegmentAudienceDto.organization_id,
        },
      });

      return {
        totalCustomerUnified,
        filters: filtered.length,
      };
    } catch (error) {
      console.error('Erro ao buscar dados para segmentação:', error);
      throw new Error(
        'Erro ao buscar dados de clientes unificados ou interações para segmentação.',
      );
    }
  }

  async buildSegmentFilters(findSegmentAudienceDto: FindSegmentAudienceSchema) {
    //console.log('buildSegmentFilters', findSegmentAudienceDto);
    const filterCustomerUnified: any[] = [];

    //TODO: FILTRO DE GÊNERO BUSCA NA TABELA DE CUSTOMER UNIFIED
    if (
      Array.isArray(findSegmentAudienceDto.gender) &&
      findSegmentAudienceDto.gender.some((g) => g.trim())
    ) {
      filterCustomerUnified.push({
        OR: findSegmentAudienceDto.gender
          .filter((g) => g.trim())
          .map((gender) => ({ gender })),
      });
    }

    //TODO: FILTRO DE MARITAL_STATUS BUSCA NA TABELA DE CUSTOMER UNIFIED
    if (
      Array.isArray(findSegmentAudienceDto.marital_status) &&
      findSegmentAudienceDto.marital_status.some((m) => m.trim())
    ) {
      filterCustomerUnified.push({
        OR: findSegmentAudienceDto.marital_status
          .filter((m) => m.trim())
          .map((marital_status) => ({ marital_status })),
      });
    }
    // console.log(
    //   '🎯 Condições Demográficas:',
    //   JSON.stringify(filterCustomerUnified, null, 2),
    // );

    //TODO: FILTRO DE ORDERS PARA BUSCAR TOTAL DE COMPRAS DO UNIFIED
    const filterOrders: any[] = [];
    if (
      findSegmentAudienceDto.total_start > 0 ||
      findSegmentAudienceDto.total_end > 0
    ) {
      const totalFilter: { gte?: number; lte?: number } = {};
      if (findSegmentAudienceDto.total_start > 0) {
        totalFilter.gte = findSegmentAudienceDto.total_start;
      }
      if (findSegmentAudienceDto.total_end > 0) {
        totalFilter.lte = findSegmentAudienceDto.total_end;
      }
      filterOrders.push({ total: totalFilter });
    }
    const filterOrderDateCreate: any[] = [];
    if (
      findSegmentAudienceDto.date_order_start ||
      findSegmentAudienceDto.date_order_end
    ) {
      const dateFilter: { gte?: Date; lte?: Date } = {};

      if (findSegmentAudienceDto.date_order_start) {
        dateFilter.gte = new Date(findSegmentAudienceDto.date_order_start);
      }
      if (findSegmentAudienceDto.date_order_end) {
        //dateFilter.lte = new Date(findSegmentAudienceDto.date_order_end);
        const endDate = new Date(findSegmentAudienceDto.date_order_end);
        endDate.setUTCHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
      filterOrderDateCreate.push({
        order_date: dateFilter,
      });
    }
    // console.log(
    //   'filterOrderDateCreate:',
    //   JSON.stringify(filterOrderDateCreate, null, 2),
    // );

    //TODO: FILTRO DE TAGS TABELA ASSOCIATIONTAGS BUSCA QUAL UNIFIED TEM A TAG
    const filterTags: any[] = [];
    if (
      Array.isArray(findSegmentAudienceDto.tag_id) &&
      findSegmentAudienceDto.tag_id.filter((t) => t.trim() !== '').length > 0
    ) {
      filterTags.push({
        tag_id: {
          in: findSegmentAudienceDto.tag_id
            .filter((id) => id !== '' && !isNaN(Number(id)))
            .map(Number),
        },
      });
    }

    //TODO: FILTRO DE ORDERS ITENS BUSCA NA TABELA ORDERITEMS
    const filterOrdersItens: any[] = [];
    //const interactionConditions: any[] = [];
    if (
      Array.isArray(findSegmentAudienceDto.refId) &&
      findSegmentAudienceDto.refId.filter((r) => r.trim() !== '').length > 0
    ) {
      filterOrdersItens.push({
        sku: {
          in: findSegmentAudienceDto.refId.filter((r) => r.trim() !== ''),
        },
      });
    }
    // console.log('OrderItens', JSON.stringify(filterOrdersItens, null, 2));

    //TODO: FILTRO PARA BUSCAR A LOJA QUE O UNIFIED COMPROU
    const filterSeller: any[] = [];
    if (
      Array.isArray(findSegmentAudienceDto.seller_ref) &&
      findSegmentAudienceDto.seller_ref.filter((r) => r.trim() !== '').length >
        0
    ) {
      filterSeller.push({
        seller_ref: {
          in: findSegmentAudienceDto.seller_ref.filter((r) => r.trim() !== ''),
        },
      });
    }

    //TODO: GRUPO DO SELLER
    const filterSellerChain: any[] = [];
    if (
      Array.isArray(findSegmentAudienceDto.store_chain) &&
      findSegmentAudienceDto.store_chain.filter((r) => r.trim() !== '').length >
        0
    ) {
      filterSellerChain.push({
        store_chain: {
          in: findSegmentAudienceDto.store_chain.filter((r) => r.trim() !== ''),
        },
      });
    }
    //console.log('filterSellerChain', filterSellerChain);

    //TODO: FILTRO DE EVENTO BUSCA NA TABELA INTERACTION
    const filterInteraction: any[] = [];

    if (
      Array.isArray(findSegmentAudienceDto.event_id) &&
      findSegmentAudienceDto.event_id.filter(
        (id) => id !== '' && !isNaN(Number(id)),
      ).length > 0
    ) {
      filterInteraction.push({
        event_id: {
          in: findSegmentAudienceDto.event_id
            .filter((id) => id !== '' && !isNaN(Number(id)))
            .map(Number),
        },
      });
    }

    //TODO: FILTRO DE FONTES BUSCA NA TABELA DE CUSTOMER
    const sourceDataConditions: any[] = [];
    if (
      Array.isArray(findSegmentAudienceDto.source_id) &&
      findSegmentAudienceDto.source_id.filter(
        (id) => id !== '' && !isNaN(Number(id)),
      ).length > 0
    ) {
      sourceDataConditions.push({
        source_id: {
          in: findSegmentAudienceDto.source_id
            .filter((id) => id !== '' && !isNaN(Number(id)))
            .map(Number),
        },
      });
    }

    const allSegmentConditions: any[] = [];

    if (filterCustomerUnified.length > 0) {
      allSegmentConditions.push({ AND: filterCustomerUnified });
    }

    if (filterInteraction.length > 0) {
      allSegmentConditions.push({
        Interaction: {
          some: {
            AND: filterInteraction,
          },
        },
      });
    }

    if (sourceDataConditions.length > 0) {
      allSegmentConditions.push({
        Customer_CustomerUnified: {
          some: {
            Customer: {
              AND: sourceDataConditions,
            },
          },
        },
      });
    }
    if (filterOrders.length > 0) {
      allSegmentConditions.push({
        Order: {
          some: {
            AND: filterOrders,
          },
        },
      });
    }

    if (filterOrdersItens.length > 0) {
      allSegmentConditions.push({
        Order: {
          some: {
            order_items: {
              some: {
                AND: filterOrdersItens,
              },
            },
          },
        },
      });
    }

    if (filterSeller.length > 0) {
      allSegmentConditions.push({
        Order: {
          some: {
            seller: {
              AND: filterSeller,
            },
          },
        },
      });
    }

    if (filterSellerChain.length > 0) {
      allSegmentConditions.push({
        Order: {
          some: {
            seller: {
              AND: filterSellerChain,
            },
          },
        },
      });
    }
    if (filterOrderDateCreate.length > 0) {
      allSegmentConditions.push({
        Order: {
          some: {
            AND: filterOrderDateCreate,
          },
        },
      });
    }

    if (filterTags.length > 0) {
      allSegmentConditions.push({
        AssociationTags: {
          some: {
            AND: filterTags,
          },
        },
      });
    }

    const finalSegmentWhere: any = {
      organization_id: findSegmentAudienceDto.organization_id,
    };

    if (allSegmentConditions.length > 0) {
      finalSegmentWhere.AND = allSegmentConditions;
    }

    // console.log(
    //   '✅ Filtro Final (finalSegmentWhere):',
    //   JSON.stringify(finalSegmentWhere, null, 2),
    // );

    return finalSegmentWhere;
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

  async findExistingAudience(organization_id: string, audienceName: string) {
    try {
      const findAudience = await this.prisma.audiences.findFirst({
        where: {
          organization_id: organization_id,
          name: audienceName,
        },
      });
      return findAudience;
    } catch (error) {
      console.log(`erro ao procurar id da audiência`, error);
      throw new HttpException(error.message, error.status);
    }
  }
}
