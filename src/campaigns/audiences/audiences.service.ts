
import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAudienceDto } from './dto/update-audience.dto';
import { PrismaService } from '@src/database/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class AudiencesService {

  constructor(
    private prisma: PrismaService,
  ) { }

  // async create(createAudienceDto: CreateAudienceDto) {
  //   console.log(createAudienceDto)
  //   const {
  //     organization_id, date_birth_start, date_birth_end, gender, marital_status, date_start, date_end, name
  //   } = createAudienceDto;
  //   console.log(createAudienceDto)

  //   const existingAudience = this.prisma.audiences.findFirst({
  //     where: {
  //       name: name,
  //     },
  //   })
  //   console.log('existingAudience', existingAudience)
  //   if (existingAudience) {
  //     throw new HttpException(
  //       `Já existe uma audiência com o nome (${createAudienceDto.name})`,
  //       409,
  //     );
  //   }

  //   // const audiencie = await this.prisma.audiences.create({
  //   //   data: {
  //   //     name: createAudienceDto.name,
  //   //     statusId: createAudienceDto.statusId ? createAudienceDto.statusId : 1,
  //   //     createdBy: createAudienceDto.createdBy ? createAudienceDto.createdBy : 1,
  //   //     organization_id: createAudienceDto.organization_id
  //   //   },
  //   // });

  //   const filters = {
  //     AND: [
  //       organization_id ? { organization_id: organization_id } : {},
  //       //date_birth ? { date_birth: String(date_birth) } : {},
  //       gender ? { gender: String(gender) } : {},
  //       marital_status ? { marital_status: String(marital_status) } : {},
  //       // (date_start && date_end) ? { created_at: { gte: startOfDay, lte: endOfDay, } } : {},
  //       // dateBirthFilter.OR.length > 0 ? dateBirthFilter : {},  // Apenas adiciona o filtro de data se houver
  //     ]
  //   }

  //   const customerUnified = this.prisma.customerUnified.findMany({
  //     where: filters
  //   })
  //   console.log('customerUnified', customerUnified)
  //   // return 'This action adds a new audience';
  // }

  //TODO CREATE AUDIENCE
  async create(params: {
    audiencia: string;
    statusId?: number;
    createdBy?: number;
    organization_id: string;
    date_birth_start?: string[] | string;
    date_birth_end?: string[] | string;
    gender?: String
    marital_status?: String
    date_start?: Date;
    date_end?: Date;
  }) {
    const {
      organization_id, date_birth_start, date_birth_end, gender, marital_status, date_start, date_end, audiencia, statusId, createdBy
    } = params;
    //console.log(params)

    const startOfDay = new Date(date_start);
    startOfDay.setHours(0, 0, 0, 0); // Define para meia-noite do início do dia
    const endOfDay = new Date(date_end);
    endOfDay.setHours(23, 59, 59, 999); // Define para o final do dia
    let dateBirthFilter = { OR: [] };

    // Garantindo que os inputs sejam arrays ou lidando com undefined
    const dates1 = date_birth_start
      ? (Array.isArray(date_birth_start)
        ? date_birth_start
        : date_birth_start.replace(/[^\d, -]/g, '').split(','))
      : []; // Caso date_birth_start seja undefined, retorna um array vazio

    const datesEnd = date_birth_end
      ? (Array.isArray(date_birth_end)
        ? date_birth_end
        : date_birth_end.replace(/[^\d, -]/g, '').split(','))
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
        console.log('  Invalid date pair, skipped.');
      }
    }
    // Resultado final do filtro
    //console.log('Final dateBirthFilter:', JSON.stringify(dateBirthFilter, null, 2));

    try {
      return await this.prisma.$transaction(
        async (trxAudi) => {
          if (audiencia === '' || audiencia === undefined || audiencia === null) {
            throw new HttpException(`Nome da audiência vazio`, 400,);
          }

          const existingAudience = await trxAudi.audiences.findFirst({
            where: {
              name: audiencia,
              organization_id: organization_id
            },
          });

          if (existingAudience) {
            throw new HttpException('Audiência já existe', 409);
          }

          const audiencie = await trxAudi.audiences.create({
            data: {
              name: audiencia,
              statusId: statusId ? statusId : 1,
              createdBy: createdBy ? createdBy : 1,
              organization_id: organization_id
            },
          });

          const filters = {
            AND: [
              organization_id ? { organization_id: organization_id } : {},
              //date_birth ? { date_birth: String(date_birth) } : {},
              gender ? { gender: String(gender) } : {},
              marital_status ? { marital_status: String(marital_status) } : {},
              (date_start && date_end) ? { created_at: { gte: startOfDay, lte: endOfDay, } } : {},
              dateBirthFilter.OR.length > 0 ? dateBirthFilter : {},  // Apenas adiciona o filtro de data se houver
            ]
          }
          //console.log(filters)
          const customerUnified = await trxAudi.customerUnified.findMany({
            where: filters
          })
          //console.log('customerUnified', customerUnified)
          const tamanho = customerUnified.length
          if (tamanho > 0) {
            const lista: number[] = customerUnified.map((id => id.id))
            //console.log(lista)
            for (const id of lista) {
              try {
                const createAudienceContacts = await trxAudi.audiencescontacts.create({
                  data: {
                    idAudience: audiencie.id,
                    idContact: id,
                    organization_id: organization_id,
                    statusId: statusId ? statusId : 1,
                    createdBy: createdBy ? createdBy : 1,
                  }
                })
                //console.log(createAudienceContacts)
              } catch (error) {
                console.log(`erro ao criar os contatos`, error)
                throw new HttpException(error.message, error.status);
              }
            }
          }
          return {
            audiencia: audiencia,
            customerUnified: customerUnified.map((id => id.id)),
            tamanho: tamanho
          }
        },
        {
          maxWait: 5000,
          timeout: 500000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      )
    } catch (error) {
      console.log(`erro ao criar audiência`, error)
      throw new HttpException(error.message, error.status);
    }
    // return 'This action adds a new audience';
  }

  //TODO FIND ALL CONTACTS OF CUSTOMER UNIFIED 
  async findAll(
    params: {
      page: number;
      limit: number;
      organization_id: string;
      date_birth_start?: string[] | string;
      date_birth_end?: string[] | string;
      gender?: String
      marital_status?: String
      date_start?: Date;
      date_end?: Date;
    }
  ) {
    const {
      page,
      limit,
      organization_id,
      date_birth_start,
      date_birth_end,
      gender,
      marital_status,
      date_start,
      date_end
    } = params;
    //console.log(params)
    const skip = (page - 1) * limit;

    const startOfDay = new Date(date_start);
    startOfDay.setHours(0, 0, 0, 0); // Define para meia-noite do início do dia
    const endOfDay = new Date(date_end);
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

    let dateBirthFilter = { OR: [] };

    // Garantindo que os inputs sejam arrays ou lidando com undefined
    const dates1 = date_birth_start
      ? (Array.isArray(date_birth_start)
        ? date_birth_start
        : date_birth_start.replace(/[^\d, -]/g, '').split(','))
      : []; // Caso date_birth_start seja undefined, retorna um array vazio

    const datesEnd = date_birth_end
      ? (Array.isArray(date_birth_end)
        ? date_birth_end
        : date_birth_end.replace(/[^\d, -]/g, '').split(','))
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

    const filters: Prisma.CustomerUnifiedWhereInput = {
      AND: [
        organization_id ? { organization_id: organization_id } : {},
        //date_birth ? { date_birth: String(date_birth) } : {},
        gender ? { gender: String(gender) } : {},
        marital_status ? { marital_status: String(marital_status) } : {},
        (date_start && date_end) ? { created_at: { gte: startOfDay, lte: endOfDay, } } : {},
        dateBirthFilter.OR.length > 0 ? dateBirthFilter : {},  // Apenas adiciona o filtro de data se houver

      ]
    }
    // console.log(filters)
    // console.log('Filters:', JSON.stringify(filters, null, 2));
    try {
      const [customerUnified, total] = await Promise.all([
        this.prisma.customerUnified.findMany({
          skip,
          take: Number(limit),
          where: filters
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
        this.prisma.customerUnified.count({ where: filters })
      ])

      return {
        data: customerUnified,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
    catch (error) {
      console.log(`erro ao procurar audiência`, error)
      throw new HttpException(error.message, error.status);
    }

    //return `This action returns all audiences`;
  }

  //TODO FIND ID AUDIENCE
  async findOne(id: number,organization_id:string) {
     try {
      //console.log(id,organization_id)
       const audience = await this.prisma.audiences.findFirst({
        where:{
          id:id,
          organization_id:organization_id
        },
       })
       return audience
     } catch (error) {
      console.log(`erro ao procurar id da audiência`, error)
      throw new HttpException(error.message, error.status);
     }
    //return `This action returns a #${id} audience`;
  }

  update(id: number, updateAudienceDto: UpdateAudienceDto) {
    return `This action updates a #${id} audience`;
  }

  remove(id: number) {
    return `This action removes a #${id} audience`;
  }
}
