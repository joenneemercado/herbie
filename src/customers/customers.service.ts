import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import {
  createCustomerSchema,
  createCustomerWithAddressSchema,
  updateCustomerSchema,
} from './dto/customer.schema';
import { JwtService } from '@nestjs/jwt';

import { createAddressSchema } from './dto/address.schema';
import { Prisma } from '@prisma/client';

// Defina o tipo para um único cliente unificado
type UnifiedCustomer = {
  email: string | null;
  cpf: string | null;
  cnpj: string | null;
  phone: string | null;
  firstname: string | null;
  lastname: string | null;
  company_name: string | null;
  trading_name: string | null;
  date_birth: Date | null;
  gender: string | null;
  marital_status: string | null;
  nickname: string | null;
  has_child: number | null;
  status_id: number;
  organization_id: string | null;
  original_ids: number[]; // IDs dos contatos originais para referência posterior
};

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async create(dataCustomer: createCustomerSchema, req: Request) {
    //console.log(req)
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, org } = await this.jwtService.decode(token);
      const createClient = {
        ...dataCustomer,
        organization_id: org,
        created_by: Number(sub),
      };
      console.log(createClient);
      const userId = sub; // Extract user ID from decoded token
      const {
        nickname,
        firstname,
        lastname,
        email,
        phone,
        cpf,
        cnpj,
        company_name,
        trading_name,
        date_birth,
        gender,
        last_updated_system,
        created_by,
      } = dataCustomer;
      if (cpf && cnpj) {
        throw new HttpException(
          'Conflit, please informe only field CPF or CNPJ',
          409,
        );
      }
      const find = await this.prisma.customer.findFirst({
        where: {
          OR: [
            {
              cpf: cpf,
            },
            {
              cnpj,
            },
          ],
        },
      });

      if (find) {
        throw new HttpException('Customer exist', 409);
      }
      return await this.prisma.customer.create({
        data: {
          organization_id: org,
          nickname,
          firstname,
          lastname,
          email,
          phone,
          cpf,
          cnpj,
          company_name,
          trading_name,
          date_birth,
          gender,
          last_updated_system,
          created_by: sub,
        },
      });
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async createWithAddress(
    dataCustomer: createCustomerWithAddressSchema,
    req: Request,
  ) {
    //console.log(req)
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, org } = await this.jwtService.decode(token);
      const createClient = {
        ...dataCustomer,
        organization_id: org,
        created_by: Number(sub),
      };
      console.log(createClient);
      const userId = sub; // Extract user ID from decoded token
      const {
        nickname,
        firstname,
        lastname,
        email,
        phone,
        cpf,
        cnpj,
        company_name,
        trading_name,
        date_birth,
        gender,
        last_updated_system,
        created_by,
      } = dataCustomer;
      if (cpf && cnpj) {
        throw new HttpException(
          'Conflit, please informe only field CPF or CNPJ',
          409,
        );
      }
      console.log(cpf, cnpj, phone);
      const conditions = [];
      if (cpf) {
        conditions.push({ cpf: cpf });
      }
      if (cnpj) {
        conditions.push({ cnpj: cnpj });
      }
      if (phone) {
        conditions.push({ phone: phone });
      }

      if (conditions.length === 0) {
        throw new Error('At least one search criteria must be provided.');
      }

      const find = await this.prisma.customer.findFirst({
        where: {
          OR: conditions,
        },
      });

      if (find) {
        console.log('tem');
        console.log(find);
        const { addresses } = dataCustomer;
        for (const address of addresses) {
          const findAddress = await this.prisma.address.findFirst({
            where: {
              address_ref: address.address_ref,
              neighborhood: address.neighborhood,
              street: address.street,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
            },
          });

          if (!findAddress) {
            await this.prisma.address.create({
              data: {
                address_ref: address.address_ref,
                neighborhood: address.neighborhood,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                address_type: address.address_type,
                country: address.country,
                is_default: address.is_default,
                organization_id: org,
                customer_id: find.public_id,
              },
            });
          }
        }
        throw new HttpException('Customer exist', 409);
      } else {
        const { addresses } = dataCustomer;
        const adds = [];
        for (const address of addresses) {
          adds.push({
            address_ref: address.address_ref,
            neighborhood: address.neighborhood,
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            address_type: address.address_type,
            country: address.country,
            is_default: address.is_default,
            organization_id: org,
            //            customer_id: find.public_id,
          });
        }

        return await this.prisma.customer.create({
          data: {
            organization_id: org,
            nickname,
            firstname,
            lastname,
            email,
            phone,
            cpf,
            cnpj,
            company_name,
            trading_name,
            date_birth,
            gender,
            last_updated_system,
            created_by: sub,
            addresses: {
              createMany: {
                data: adds,
              },
            },
          },
        });
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  async createAddress(dataCustomer: createAddressSchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, org } = await this.jwtService.decode(token);

      const userId = sub; // Extract user ID from decoded token
      const {
        address_ref,
        address_type,
        city,
        country,
        customer_id,
        is_default,
        neighborhood,
        organization_id,
        postal_code,
        state,
        street,
      } = dataCustomer;

      const find = await this.prisma.address.findFirst({
        where: {
          organization_id: organization_id,
          customer_id: customer_id,
          address_ref: address_ref,
          city: city,
          state: state,
          address_type: address_type,
        },
      });

      if (find) {
        console.log('tem');
        throw new HttpException('Address exist', 409);
      } else {
        return await this.prisma.address.create({
          data: {
            organization_id: organization_id,
            address_ref,
            address_type,
            city,
            country,
            customer_id,
            is_default,
            neighborhood,
            postal_code,
            state,
            street,
          },
        });
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async update(dataUpdate: updateCustomerSchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    const token = reqToken.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as { sub: number };
    const userId = decodedToken.sub; // Extract user ID from decoded token
    //const organization_id = decodedToken.org;
    const find = await this.prisma.customer.findFirst({
      where: {
        id: dataUpdate.id,
      },
    });
    if (find) {
      const { id, ...updateData } = dataUpdate;
      return await this.prisma.customer.update({
        where: {
          id: find.id,
        },
        data: updateData,
      });
    }

    //this.prisma.customer.update({ where: { data.id }, data: parsedData.data });
    return '';
  }

  // async findAll(params: {
  //   page: number;
  //   limit: number;
  //   name?: string;
  //   email?: string;
  //   phone?: string;
  //   cpf?: string;
  //   organization_id?: string;
  //   is_unified?: boolean;
  // }) {
  //   const {
  //     page,
  //     limit,
  //     name,
  //     email,
  //     phone,
  //     cpf,
  //     organization_id,
  //     is_unified,
  //   } = params;
  //   const skip = (page - 1) * limit;

  //   const filters: Prisma.CustomerWhereInput = {
  //     AND: [
  //       name ? { firstname: { contains: name, mode: 'insensitive' } } : {},
  //       phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
  //       cpf ? { cpf: cpf } : {},
  //       email ? { email: { contains: email, mode: 'insensitive' } } : {},
  //       organization_id ? { organization_id: organization_id } : {},
  //       is_unified === undefined ? {} : {},
  //       is_unified === false
  //         ? { OR: [{ is_unified: false }, { is_unified: null }] }
  //         : {},
  //       is_unified ? { is_unified: true } : {},
  //     ],
  //   };
  //   console.log(is_unified);
  //   console.log(filters);
  //   try {
  //     const [result, total] = await Promise.all([
  //       this.prisma.customer.findMany({
  //         include: {
  //           addresses: {
  //             take: 1,
  //             orderBy: {
  //               id: 'desc',
  //             },
  //           },
  //           Source: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //         skip,
  //         take: Number(limit),
  //         where: filters,
  //       }),
  //       this.prisma.customer.count({ where: filters }),
  //     ]);

  //     return {
  //       data: result,
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     };
  //   } catch (error) {
  //     console.error('Error fetching customers:', error);
  //     throw error;
  //   }
  // }

  async findAll(params: {
    page: number;
    limit: number;
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    organization_id?: string;
    is_unified?: boolean;
    sortBy?: string;
    source?: string;
    order?: 'asc' | 'desc';
    public_id?: string;
  }) {
    const {
      page,
      limit,
      name,
      email,
      phone,
      cpf,
      organization_id,
      is_unified,
      sortBy,
      source,
      order,
      public_id,
    } = params;
    //console.log('Parameters for findAll:', params);
    const skip = (page - 1) * limit;
    //console.log('Calculated skip value:', skip);
    let sourceObj = null;
    if (source) {
      sourceObj = await this.prisma.source.findFirst({
        where: { name: source },
      });
    }

    const filters: Prisma.CustomerWhereInput = {
      AND: [
        source && sourceObj ? { source_id: sourceObj.id } : {},
        name ? { firstname: { contains: name, mode: 'insensitive' } } : {},
        phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
        cpf ? { cpf: cpf } : {},
        email ? { email: { contains: email, mode: 'insensitive' } } : {},
        organization_id ? { organization_id: organization_id } : {},
        public_id ? { public_id: public_id } : {},
        is_unified === undefined ? {} : {},
        is_unified === false
          ? { OR: [{ is_unified: false }, { is_unified: null }] }
          : {},
        is_unified ? { is_unified: true } : {},
      ] as const,
    };
    //console.log('Constructed filters:', filters);

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};

    if (sortBy) {
      switch (sortBy) {
        case 'name':
          orderBy.firstname = order;
          break;
        case 'source':
          orderBy.source_id = order;
          break;
        case 'updated_at':
          orderBy.updated_at = order;
          break;
        default:
          break;
      }
    }
    //console.log('Constructed orderBy:', orderBy);

    try {
      const [result, total] = await Promise.all([
        this.prisma.customer.findMany({
          include: {
            addresses: {
              take: 1,
              orderBy: {
                id: 'asc',
              },
            },
            Source: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: Number(limit),
          where: filters,
          orderBy,
        }),
        this.prisma.customer.count({ where: filters }),
      ]);

      //console.log('Query results:', { result, total });

      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // async findUnifiedAll(params: {
  //   page: number;
  //   limit: number;
  //   name?: string;
  //   email?: string;
  //   phone?: string;
  //   cpf?: string;
  //   organization_id?: string;
  //   store?: string;
  // }) {
  //   const { page, limit, name, email, phone, cpf, organization_id, store } =
  //     params;
  //   const skip = (page - 1) * limit;

  //   const filters: Prisma.CustomerUnifiedWhereInput = {
  //     AND: [
  //       name ? { firstname: { contains: name, mode: 'insensitive' } } : {},
  //       phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
  //       cpf ? { cpf: cpf } : {},
  //       email ? { email: { contains: email, mode: 'insensitive' } } : {},
  //       organization_id ? { organization_id: organization_id } : {},
  //       store
  //         ? { customer_fields: { some: { type: 'STORE', value: store } } }
  //         : {},
  //     ],
  //   };

  //   try {
  //     const [result, total] = await Promise.all([
  //       this.prisma.customerUnified.findMany({
  //         include: {
  //           addresses: {
  //             take: 1,
  //             orderBy: {
  //               id: 'desc',
  //             },
  //           },
  //           customer_fields: true,
  //         },
  //         skip,
  //         take: Number(limit),
  //         where: filters,
  //       }),
  //       this.prisma.customerUnified.count({ where: filters }),
  //     ]);

  //     return {
  //       data: result,
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     };
  //   } catch (error) {
  //     console.error('Error fetching customers Unified:', error);
  //     throw error;
  //   }
  // }

  // async unifyExactDuplicates() {
  //   console.log('Passo 1: Encontrar duplicatas exatas');

  //   // Passo 1: Encontrar registros duplicados
  //   const duplicatedCpfs = await this.prisma.customer.groupBy({
  //     by: ['cpf', 'organization_id'],
  //     _count: {
  //       id: true,
  //     },
  //     where: {
  //       cpf: {
  //         not: null, // Exclui registros onde o cpf é null
  //       },
  //       OR: [{ is_unified: false }, { is_unified: null }],
  //     },
  //     having: {
  //       id: {
  //         _count: {
  //           gt: 1,
  //         },
  //       },
  //     },
  //   });

  //   console.log(`Quantidade de CPFs duplicados: ${duplicatedCpfs.length}`);

  //   const cpfs = duplicatedCpfs.map((customer) => customer.cpf);

  //   const customersWithData = await this.prisma.customer.findMany({
  //     where: {
  //       cpf: {
  //         in: cpfs,
  //       },
  //     },
  //     orderBy: {
  //       cpf: 'asc',
  //     },
  //   });

  //   type FieldUnifield = UnifiedCustomer[];
  //   const listaUnifield: FieldUnifield = [];
  //   console.log(
  //     `Total de clientes com dados duplicados: ${customersWithData.length}`,
  //   );

  //   //let count = 0;

  //   const unifyField = <T>(
  //     fieldName: keyof UnifiedCustomer,
  //     existingValue: T | null,
  //     newValue: T | null,
  //     fieldStatusCode: number, // Código de status específico do campo
  //     status: number, // Status atual
  //   ): [T | null, number, boolean] => {
  //     if (existingValue === newValue) {
  //       console.log(`${fieldName} iguais.`);
  //       return [existingValue, status, false]; // Nenhuma divergência
  //     } else {
  //       if (existingValue == null && newValue != null) {
  //         console.log(`Atualizando ${fieldName} com valor: ${newValue}`);
  //         return [newValue, status, false]; // Atualização sem divergência
  //       } else {
  //         console.log(`Diferença encontrada em ${fieldName}.`);
  //         // Atualiza o status para o código específico se for a primeira divergência
  //         const updatedStatus = status > 1 ? 2 : fieldStatusCode; // Se já houve divergência, status = 2
  //         return [existingValue, updatedStatus, true]; // Houve divergência
  //       }
  //     }
  //   };

  //   // Unificação dos registros duplicados e criação do contato unificado
  //   for (const group of customersWithData) {
  //     console.log(`Processando CPF: ${group.cpf}`);
  //     const exist = listaUnifield.find((item) => item.cpf === group.cpf);
  //     if (exist) {
  //       console.log('Registro existente encontrado, verificando dados...');

  //       // Armazenar o ID do contato original
  //       exist.original_ids.push(group.id);

  //       // Função auxiliar para unificar campos
  //       let status = 1;
  //       let divergenceCount = 0; // Contador de divergências

  //       // Unificação dos campos
  //       let result;
  //       [exist.firstname, status, result] = unifyField(
  //         'firstname',
  //         exist.firstname?.split(' ')[0].toLocaleLowerCase() as string | null,
  //         group.firstname.split(' ')[0].toLowerCase(),
  //         3, // Código de status específico para `firstname`
  //         status,
  //       );
  //       if (result) {
  //         exist.firstname = null;
  //         divergenceCount++;
  //       }

  //       [exist.lastname, status, result] = unifyField(
  //         'lastname',
  //         exist.lastname?.toLocaleLowerCase() as string | null,
  //         group.lastname.toLocaleLowerCase(),
  //         4, // Código de status específico para `lastname`
  //         status,
  //       );
  //       if (result) {
  //         exist.lastname = null;
  //         divergenceCount++;
  //       }

  //       [exist.email, status, result] = unifyField(
  //         'email',
  //         exist.email,
  //         group.email,
  //         5,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.cpf, status, result] = unifyField(
  //         'cpf',
  //         exist.cpf,
  //         group.cpf,
  //         6,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.cnpj, status, result] = unifyField(
  //         'cnpj',
  //         exist.cnpj,
  //         group.cnpj,
  //         7,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.phone, status, result] = unifyField(
  //         'phone',
  //         exist.phone,
  //         group.phone,
  //         8,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.company_name, status, result] = unifyField(
  //         'company_name',
  //         exist.company_name,
  //         group.company_name,
  //         9,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.trading_name, status, result] = unifyField(
  //         'trading_name',
  //         exist.trading_name,
  //         group.trading_name,
  //         15,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.date_birth, status, result] = unifyField(
  //         'date_birth',
  //         exist.date_birth,
  //         group.date_birth,
  //         10,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.gender, status, result] = unifyField(
  //         'gender',
  //         exist.gender,
  //         group.gender,
  //         11,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.marital_status, status, result] = unifyField(
  //         'marital_status',
  //         exist.marital_status,
  //         group.marital_status,
  //         12,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.nickname, status, result] = unifyField(
  //         'nickname',
  //         exist.nickname,
  //         group.nickname,
  //         13,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       [exist.has_child, status, result] = unifyField(
  //         'has_child',
  //         exist.has_child,
  //         group.has_child,
  //         14,
  //         status,
  //       );
  //       if (result) divergenceCount++;

  //       // Atualiza o status para 2 se houver mais de uma divergência
  //       if (divergenceCount > 1) {
  //         exist.status_id = 2;
  //       } else {
  //         exist.status_id = fieldSta;
  //       }

  //       console.log(`Status final para CPF ${exist.cpf}: ${exist.status_id}`);
  //     } else {
  //       // Adiciona um novo registro unificado à lista e armazena o ID original
  //       console.log('else');
  //       listaUnifield.push({
  //         firstname: group.firstname,
  //         lastname: group.lastname,
  //         phone: group.phone,
  //         email: group.email,
  //         cnpj: group.cnpj,
  //         cpf: group.cpf,
  //         company_name: group.company_name,
  //         trading_name: group.trading_name,
  //         date_birth: group.date_birth,
  //         gender: group.gender,
  //         marital_status: group.marital_status,
  //         has_child: group.has_child,
  //         nickname: group.nickname,
  //         status_id: 1,
  //         organization_id: group.organization_id,
  //         original_ids: [group.id], // Armazenar o ID do contato original
  //       });
  //     }

  //     // Limita a iteração a 3 registros para fins de teste
  //     // if (count === 11) {
  //     //   break;
  //     // }
  //     //count++;
  //   }

  //   console.log('Lista Unificada:', listaUnifield);

  //   // Processar a tabela CustomerUnified e as referências
  //   for (const uni of listaUnifield) {
  //     console.log(
  //       `Verificando se o CPF ${uni.cpf} já existe na tabela CustomerUnified`,
  //     );

  //     // Buscar o registro correspondente na tabela CustomerUnified
  //     const existingUnifiedCustomer =
  //       await this.prisma.customerUnified.findFirst({
  //         where: { cpf: uni.cpf }, // Supondo que `cpf` seja único na tabela CustomerUnified
  //       });

  //     let unifiedCustomerId: number;

  //     if (existingUnifiedCustomer) {
  //       console.log(`Cliente unificado encontrado para o CPF ${uni.cpf}.`);
  //       unifiedCustomerId = existingUnifiedCustomer.id;
  //     } else {
  //       // Se não houver registro existente, criar um novo registro em CustomerUnified
  //       console.log(
  //         `Cliente unificado não encontrado para o CPF ${uni.cpf}. Criando novo registro...`,
  //       );
  //       const newUnifiedCustomer = await this.prisma.customerUnified.create({
  //         data: {
  //           firstname: uni.firstname,
  //           lastname: uni.lastname,
  //           email: uni.email,
  //           cnpj: uni.cnpj,
  //           cpf: String(uni.cpf),
  //           phone: uni.phone,
  //           company_name: uni.company_name,
  //           trading_name: uni.trading_name,
  //           date_birth: new Date(uni.date_birth),
  //           gender: uni.gender,
  //           marital_status: uni.marital_status,
  //           nickname: uni.nickname,
  //           has_child: uni.has_child ? uni.has_child : undefined,
  //           status_id: Number(uni.status_id),
  //           organization_id: String(uni.organization_id),
  //         },
  //       });
  //       unifiedCustomerId = newUnifiedCustomer.id;
  //     }

  //     // Criar a referência na tabela Customer_CustomerUnified
  //     console.log(
  //       `Criando referências para o cliente unificado ${unifiedCustomerId}`,
  //     );

  //     for (const originalId of uni.original_ids) {
  //       const existingReference =
  //         await this.prisma.customer_CustomerUnified.findFirst({
  //           where: {
  //             customer_id: originalId,
  //             customer_unified_id: unifiedCustomerId,
  //           },
  //         });

  //       if (!existingReference) {
  //         await this.prisma.customer_CustomerUnified.create({
  //           data: {
  //             customer_id: originalId, // ID do cliente original
  //             customer_unified_id: unifiedCustomerId, // ID do cliente unificado
  //           },
  //         });
  //         console.log(
  //           `Referência criada para o cliente original ${originalId} e unificado ${unifiedCustomerId}`,
  //         );
  //         await this.prisma.customer.update({
  //           where: { id: Number(originalId) },
  //           data: {
  //             is_unified: true,
  //           },
  //         });
  //       } else {
  //         console.log(
  //           `Referência já existente para o cliente original ${originalId} e unificado ${unifiedCustomerId}`,
  //         );
  //       }
  //     }
  //   }
  // }

  async findUnifiedAll(params: {
    page: number;
    limit: number;
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    organization_id?: string;
    store?: string;
  }) {
    const { page, limit, name, email, phone, cpf, organization_id, store } =
      params;
    const skip = (page - 1) * limit;

    const filters: Prisma.CustomerUnifiedWhereInput = {
      AND: [
        name ? { firstname: { contains: name, mode: 'insensitive' } } : {},
        phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
        cpf ? { cpf: cpf } : {},
        email ? { email: { contains: email, mode: 'insensitive' } } : {},
        organization_id ? { organization_id: organization_id } : {},
        store
          ? { customer_fields: { some: { type: 'STORE', value: store } } }
          : {},
      ],
    };

    try {
      // Passo 1: Executar as consultas de clientes e contagem total em paralelo
      const [customers, total] = await Promise.all([
        this.prisma.customerUnified.findMany({
          include: {
            addresses: {
              take: 1,
              orderBy: {
                id: 'desc',
              },
            },
            customer_fields: {
              select: {
                type: true,
                description: true,
                value: true,
              },
            },
          },
          skip,
          take: Number(limit),
          where: filters,
        }),
        this.prisma.customerUnified.count({ where: filters }),
      ]);

      if (customers.length === 0) {
        return {
          data: [],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }

      // Passo 2: Coletar todos os IDs de loja (sellers) únicos dos resultados
      const storeIds = [
        ...new Set( // Usa Set para garantir que os IDs sejam únicos
          customers
            .flatMap((customer) => customer.customer_fields) // Pega todos os fields de todos os customers
            .filter((field) => field.type === 'STORE' && field.value) // Filtra apenas os do tipo STORE com valor
            .map((field) => parseInt(field.value, 10)), // Converte o ID para número
        ),
      ];

      // Passo 3: Buscar todos os sellers necessários em uma única query
      const sellers = await this.prisma.seller.findMany({
        where: {
          id: {
            in: storeIds,
          },
        },
        select: {
          // Seleciona apenas os campos que você precisa
          id: true,
          name: true,
        },
      });

      // Criar um mapa para busca rápida (O(1)) dos sellers por ID
      const sellersMap = new Map(sellers.map((seller) => [seller.id, seller]));

      // Passo 4: Mapear os dados dos sellers de volta para a estrutura dos clientes
      const enrichedData = customers.map((customer) => {
        const enrichedFields = customer.customer_fields.map((field) => {
          if (field.type === 'STORE') {
            const sellerId = parseInt(field.value, 10);
            const sellerInfo = sellersMap.get(sellerId);
            return {
              ...field, // Mantém os campos originais de customer_field
              Seller: sellerInfo || null, // Adiciona o objeto Seller
            };
          }
          return field;
        });

        return {
          ...customer, // Mantém os campos originais do customer
          customer_fields: enrichedFields, // Substitui pelos fields enriquecidos
        };
      });

      return {
        data: enrichedData, // Retorna os dados já com as informações do Seller
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
  async unifyExactDuplicates() {
    console.log('Passo 1: Encontrar duplicatas exatas');

    // Passo 1: Encontrar registros duplicados
    const duplicatedCpfs = await this.prisma.customer.groupBy({
      by: ['cpf', 'organization_id'],
      _count: {
        id: true,
      },
      where: {
        cpf: {
          not: null, // Exclui registros onde o cpf é null
        },
        OR: [{ is_unified: false }, { is_unified: null }],
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    console.log(`Quantidade de CPFs duplicados: ${duplicatedCpfs.length}`);

    const cpfs = duplicatedCpfs.map((customer) => customer.cpf);

    const customersWithData = await this.prisma.customer.findMany({
      where: {
        cpf: {
          in: cpfs,
        },
      },
      orderBy: {
        cpf: 'asc',
      },
    });

    type FieldUnifield = UnifiedCustomer[];
    const listaUnifield: FieldUnifield = [];
    console.log(
      `Total de clientes com dados duplicados: ${customersWithData.length}`,
    );

    // Função para normalizar strings
    const normalizeString = (str: string): string => {
      return str
        .normalize('NFD') // Decompor acentos
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-zA-Z0-9]/g, '') // Remover caracteres especiais
        .toLowerCase(); // Converter para minúsculas
    };

    // Unificação dos registros duplicados e criação do contato unificado
    for (const group of customersWithData) {
      console.log(`Processando CPF: ${group.cpf}`);
      const exist = listaUnifield.find((item) => item.cpf === group.cpf);
      if (exist) {
        console.log('Registro existente encontrado, verificando dados...');

        // Armazenar o ID do contato original
        exist.original_ids.push(group.id);

        let divergenceCount = 0;
        let firstDivergenceStatusCode = null;

        // Função auxiliar para comparar valores normalizados
        const compareValues = (val1: any, val2: any): boolean => {
          if (typeof val1 === 'string' && typeof val2 === 'string') {
            return normalizeString(val1) === normalizeString(val2);
          }
          return val1 === val2;
        };

        // Unificação dos campos

        // Firstname
        const existingFirstNameForComparison = exist.firstname
          ? normalizeString(exist.firstname.split(' ')[0])
          : null;
        const newFirstNameForComparison = group.firstname
          ? normalizeString(group.firstname.split(' ')[0])
          : null;

        if (existingFirstNameForComparison === newFirstNameForComparison) {
          console.log('firstname iguais.');
        } else if (exist.firstname == null) {
          console.log(`Atualizando firstname com valor: ${group.firstname}`);
          exist.firstname = group.firstname;
        } else {
          console.log(`Diferença encontrada em firstname.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.firstname = null;
            firstDivergenceStatusCode = 3; // Código de status específico para `firstname`
          }
        }

        // Lastname
        const existingLastName = exist.lastname
          ? normalizeString(exist.lastname)
          : null;
        const newLastName = group.lastname
          ? normalizeString(group.lastname)
          : null;

        if (existingLastName === newLastName) {
          console.log('lastname iguais.');
        } else if (exist.lastname == null) {
          console.log(`Atualizando lastname com valor: ${group.lastname}`);
          exist.lastname = group.lastname;
        } else {
          console.log(`Diferença encontrada em lastname.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.lastname = null;
            firstDivergenceStatusCode = 4; // Código de status específico para `lastname`
          }
        }

        // Email
        if (compareValues(exist.email, group.email)) {
          console.log('email iguais.');
        } else if (exist.email == null) {
          console.log(`Atualizando email com valor: ${group.email}`);
          exist.email = group.email;
        } else {
          console.log(`Diferença encontrada em email.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.email = group.email;
            firstDivergenceStatusCode = 5;
          }
        }

        // CPF
        if (compareValues(exist.cpf, group.cpf)) {
          console.log('cpf iguais.');
        } else {
          console.log(`Diferença encontrada em cpf.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            firstDivergenceStatusCode = 6;
          }
        }

        // CNPJ
        if (compareValues(exist.cnpj, group.cnpj)) {
          console.log('cnpj iguais.');
        } else if (exist.cnpj == null) {
          console.log(`Atualizando cnpj com valor: ${group.cnpj}`);
          exist.cnpj = group.cnpj;
        } else {
          console.log(`Diferença encontrada em cnpj.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            firstDivergenceStatusCode = 7;
          }
        }

        // Phone
        if (compareValues(exist.phone, group.phone)) {
          console.log('phone iguais.');
        } else if (exist.phone == null) {
          console.log(`Atualizando phone com valor: ${group.phone}`);
          exist.phone = group.phone;
        } else {
          console.log(`Diferença encontrada em phone.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.phone = null;
            firstDivergenceStatusCode = 8;
          }
        }

        // Company Name
        if (compareValues(exist.company_name, group.company_name)) {
          console.log('company_name iguais.');
        } else if (exist.company_name == null) {
          console.log(
            `Atualizando company_name com valor: ${group.company_name}`,
          );
          exist.company_name = group.company_name;
        } else {
          console.log(`Diferença encontrada em company_name.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.company_name = null;
            firstDivergenceStatusCode = 9;
          }
        }

        // Trading Name
        if (compareValues(exist.trading_name, group.trading_name)) {
          console.log('trading_name iguais.');
        } else if (exist.trading_name == null) {
          console.log(
            `Atualizando trading_name com valor: ${group.trading_name}`,
          );
          exist.trading_name = group.trading_name;
        } else {
          console.log(`Diferença encontrada em trading_name.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.trading_name = null;
            firstDivergenceStatusCode = 15;
          }
        }

        // Date of Birth
        const existingDateBirth = exist.date_birth
          ? exist.date_birth.toISOString().split('T')[0]
          : null;
        const newDateBirth = group.date_birth
          ? group.date_birth.toISOString().split('T')[0]
          : null;

        if (compareValues(existingDateBirth, newDateBirth)) {
          console.log('date_birth iguais.');
        } else if (exist.date_birth == null && group.date_birth != null) {
          console.log(`Atualizando date_birth com valor: ${group.date_birth}`);
          exist.date_birth = group.date_birth;
        } else {
          console.log(`Diferença encontrada em date_birth.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            firstDivergenceStatusCode = 10;
          }
        }

        // Gender
        if (compareValues(exist.gender, group.gender)) {
          console.log('gender iguais.');
        } else if (exist.gender == null) {
          console.log(`Atualizando gender com valor: ${group.gender}`);
          exist.gender = group.gender;
        } else {
          console.log(`Diferença encontrada em gender.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.gender = null;
            firstDivergenceStatusCode = 11;
          }
        }

        // Marital Status
        if (compareValues(exist.marital_status, group.marital_status)) {
          console.log('marital_status iguais.');
        } else if (exist.marital_status == null) {
          console.log(
            `Atualizando marital_status com valor: ${group.marital_status}`,
          );
          exist.marital_status = group.marital_status;
        } else {
          console.log(`Diferença encontrada em marital_status.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.marital_status = null;
            firstDivergenceStatusCode = 12;
          }
        }

        // Nickname
        if (compareValues(exist.nickname, group.nickname)) {
          console.log('nickname iguais.');
        } else if (exist.nickname == null) {
          console.log(`Atualizando nickname com valor: ${group.nickname}`);
          exist.nickname = group.nickname;
        } else {
          console.log(`Diferença encontrada em nickname.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.nickname = null;
            firstDivergenceStatusCode = 13;
          }
        }

        // Has Child
        if (compareValues(exist.has_child, group.has_child)) {
          console.log('has_child iguais.');
        } else if (exist.has_child == null) {
          console.log(`Atualizando has_child com valor: ${group.has_child}`);
          exist.has_child = group.has_child;
        } else {
          console.log(`Diferença encontrada em has_child.`);
          divergenceCount++;
          if (divergenceCount === 1) {
            exist.has_child = null;
            firstDivergenceStatusCode = 14;
          }
        }

        // Atualiza o status
        if (divergenceCount === 0) {
          exist.status_id = 1;
        } else if (divergenceCount === 1) {
          exist.status_id = firstDivergenceStatusCode;
        } else {
          exist.status_id = 2;
        }

        console.log(`Status final para CPF ${exist.cpf}: ${exist.status_id}`);
      } else {
        // Adiciona um novo registro unificado à lista e armazena o ID original
        console.log('Criando novo registro unificado.');
        listaUnifield.push({
          firstname: group.firstname,
          lastname: group.lastname,
          phone: group.phone,
          email: group.email,
          cnpj: group.cnpj,
          cpf: group.cpf,
          company_name: group.company_name,
          trading_name: group.trading_name,
          date_birth: group.date_birth,
          gender: group.gender,
          marital_status: group.marital_status,
          has_child: group.has_child,
          nickname: group.nickname,
          status_id: 1,
          organization_id: group.organization_id,
          original_ids: [group.id], // Armazenar o ID do contato original
        });
      }
    }

    console.log('Lista Unificada:', listaUnifield);

    // Processar a tabela CustomerUnified e as referências
    for (const uni of listaUnifield) {
      console.log(
        `Verificando se o CPF ${uni.cpf} já existe na tabela CustomerUnified`,
      );

      // Buscar o registro correspondente na tabela CustomerUnified
      const existingUnifiedCustomer =
        await this.prisma.customerUnified.findFirst({
          where: { cpf: uni.cpf }, // Supondo que `cpf` seja único na tabela CustomerUnified
        });

      let unifiedCustomerId: number;

      if (existingUnifiedCustomer) {
        console.log(`Cliente unificado encontrado para o CPF ${uni.cpf}.`);
        unifiedCustomerId = existingUnifiedCustomer.id;
      } else {
        // Se não houver registro existente, criar um novo registro em CustomerUnified
        console.log(
          `Cliente unificado não encontrado para o CPF ${uni.cpf}. Criando novo registro...`,
        );
        const newUnifiedCustomer = await this.prisma.customerUnified.create({
          data: {
            firstname: uni.firstname,
            lastname: uni.lastname,
            email: uni.email,
            cnpj: uni.cnpj,
            cpf: String(uni.cpf),
            phone: uni.phone,
            company_name: uni.company_name,
            trading_name: uni.trading_name,
            date_birth: uni.date_birth ? new Date(uni.date_birth) : null,
            gender: uni.gender,
            marital_status: uni.marital_status,
            nickname: uni.nickname,
            has_child: uni.has_child ? uni.has_child : undefined,
            status_id: Number(uni.status_id),
            organization_id: String(uni.organization_id),
          },
        });
        unifiedCustomerId = newUnifiedCustomer.id;
      }

      // Criar a referência na tabela Customer_CustomerUnified
      console.log(
        `Criando referências para o cliente unificado ${unifiedCustomerId}`,
      );

      for (const originalId of uni.original_ids) {
        const existingReference =
          await this.prisma.customer_CustomerUnified.findFirst({
            where: {
              customer_id: originalId,
              customer_unified_id: unifiedCustomerId,
            },
          });

        if (!existingReference) {
          await this.prisma.customer_CustomerUnified.create({
            data: {
              customer_id: originalId, // ID do cliente original
              customer_unified_id: unifiedCustomerId, // ID do cliente unificado
            },
          });
          console.log(
            `Referência criada para o cliente original ${originalId} e unificado ${unifiedCustomerId}`,
          );
          await this.prisma.customer.update({
            where: { id: Number(originalId) },
            data: {
              is_unified: true,
            },
          });
        } else {
          console.log(
            `Referência já existente para o cliente original ${originalId} e unificado ${unifiedCustomerId}`,
          );
        }
      }
    }
  }

  async unifyFindCPFCustomer() {
    //Buscar Por cpfs
    const customers = await this.prisma.customer.findMany({
      where: {
        cpf: {
          not: null, // Exclui registros onde o cpf é null
        },
        OR: [{ is_unified: false }, { is_unified: null }],
      },
    });
    console.log('Total de items CPF - ' + customers.length);
    for (const customer of customers) {
      const existCustomUnifield = await this.prisma.customerUnified.findFirst({
        where: {
          cpf: String(customer.cpf),
        },
      });
      if (existCustomUnifield) {
        //preciso comparar os campos
        const unifyField = <T>(
          fieldName: keyof UnifiedCustomer,
          existingValue: T | null,
          newValue: T | null,
          fieldStatusCode: number, // Código de status específico do campo
          status: number, // Status atual
        ): [T | null, number, boolean] => {
          if (existingValue === newValue) {
            console.log(`${fieldName} iguais.`);
            return [existingValue, status, false]; // Nenhuma divergência
          } else {
            if (existingValue == null && newValue != null) {
              console.log(`Atualizando ${fieldName} com valor: ${newValue}`);
              return [newValue, status, false]; // Atualização sem divergência
            } else {
              console.log(`Diferença encontrada em ${fieldName}.`);
              // Atualiza o status para o código específico se for a primeira divergência
              const updatedStatus = status > 1 ? 2 : fieldStatusCode; // Se já houve divergência, status = 2
              return [existingValue, updatedStatus, true]; // Houve divergência
            }
          }
        };

        // Unificação dos registros duplicados e criação do contato unificado
        console.log(`Processando CPF: ${existCustomUnifield.cpf}`);

        console.log('Registro existente encontrado, verificando dados...');

        // Função auxiliar para unificar campos
        let status = 1;
        let divergenceCount = 0; // Contador de divergências

        // Unificação dos campos
        let result;
        [existCustomUnifield.firstname, status, result] = unifyField(
          'firstname',
          existCustomUnifield.firstname?.split(' ')[0].toLocaleLowerCase() as
          | string
          | null,
          customer.firstname.split(' ')[0].toLowerCase(),
          3, // Código de status específico para `firstname`
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.lastname, status, result] = unifyField(
          'lastname',
          existCustomUnifield.lastname?.toLocaleLowerCase() as string | null,
          customer.lastname.toLocaleLowerCase(),
          4, // Código de status específico para `lastname`
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.email, status, result] = unifyField(
          'email',
          existCustomUnifield.email,
          customer.email,
          5,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.cpf, status, result] = unifyField(
          'cpf',
          existCustomUnifield.cpf,
          customer.cpf,
          6,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.cnpj, status, result] = unifyField(
          'cnpj',
          existCustomUnifield.cnpj,
          customer.cnpj,
          7,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.phone, status, result] = unifyField(
          'phone',
          existCustomUnifield.phone,
          customer.phone,
          8,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.company_name, status, result] = unifyField(
          'company_name',
          existCustomUnifield.company_name,
          customer.company_name,
          9,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.trading_name, status, result] = unifyField(
          'trading_name',
          existCustomUnifield.trading_name,
          customer.trading_name,
          15,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.date_birth, status, result] = unifyField(
          'date_birth',
          existCustomUnifield.date_birth,
          customer.date_birth,
          10,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.gender, status, result] = unifyField(
          'gender',
          existCustomUnifield.gender,
          customer.gender,
          11,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.marital_status, status, result] = unifyField(
          'marital_status',
          existCustomUnifield.marital_status,
          customer.marital_status,
          12,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.nickname, status, result] = unifyField(
          'nickname',
          existCustomUnifield.nickname,
          customer.nickname,
          13,
          status,
        );
        if (result) divergenceCount++;

        [existCustomUnifield.has_child, status, result] = unifyField(
          'has_child',
          existCustomUnifield.has_child,
          customer.has_child,
          14,
          status,
        );
        if (result) divergenceCount++;

        // Atualiza o status para 2 se houver mais de uma divergência
        if (divergenceCount > 1) {
          existCustomUnifield.status_id = 2;
          await this.prisma.customerUnified.update({
            where: {
              id: existCustomUnifield.id,
            },
            data: {
              status_id: 2,
            },
          });
          await this.prisma.customer_CustomerUnified.createMany({
            data: {
              customer_id: customer.id,
              customer_unified_id: existCustomUnifield.id,
            },
            skipDuplicates: true,
          });
          await this.prisma.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              is_unified: true,
            },
          });
        } else {
          await this.prisma.customerUnified.update({
            where: {
              id: existCustomUnifield.id,
            },
            data: {
              status_id: existCustomUnifield.status_id,
            },
          });
          await this.prisma.customer_CustomerUnified.createMany({
            data: {
              customer_id: customer.id,
              customer_unified_id: existCustomUnifield.id,
            },
            skipDuplicates: true,
          });
          await this.prisma.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              is_unified: true,
            },
          });
        }

        console.log(
          `Status final para CPF ${existCustomUnifield.cpf}: ${existCustomUnifield.status_id}`,
        );
      } else {
        try {
          const unico = await this.prisma.customerUnified.create({
            data: {
              firstname: customer.firstname.toLowerCase(),
              lastname: customer.lastname.toLowerCase(),
              cpf: String(customer.cpf),
              cnpj: customer.cnpj,
              company_name: customer.company_name,
              date_birth: customer.date_birth
                ? new Date(customer.date_birth)
                : undefined,
              email: customer.email,
              gender: customer.gender,
              has_child: customer.has_child,
              nickname: customer.nickname,
              marital_status: customer.marital_status,
              created_by: 1,
              phone: customer.phone,
              status_id: 1,
              trading_name: customer.trading_name,
              organization_id: customer.organization_id,
              whatsapp: customer.whatsapp,
              instagram: customer.instagram,
              facebook: customer.facebook,
              x: customer.x,
            },
          });
          const associado =
            await this.prisma.customer_CustomerUnified.createMany({
              data: {
                customer_id: customer.id,
                customer_unified_id: unico.id,
              },
              skipDuplicates: true,
            });
          await this.prisma.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              is_unified: true,
            },
          });
        } catch (error) {
          console.log('Falha ao processar ');
        }
      }
    }
  }

  async findAllCustomerUnifieldCursor(cursor?: number, limit: number = 10) {
    console.log(cursor, limit);
    const customerUnifieds = await this.prisma.customerUnified.findMany({
      take: limit + 1, // Pega um item extra para verificar se há próxima página
      skip: cursor ? 1 : 0, // Pula o cursor
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
      include: { customer_fields: true },
    });

    //const customerUnified2 = await this.prisma.customerUnified.findMany();
    //console.log(customerUnified2.length);
    console.log(customerUnifieds);
    let nextCursor: number | null = null;
    let lastCursor: number | null = null;
    if (customerUnifieds.length > limit) {
      const nextItem = customerUnifieds.pop();
      nextCursor = nextItem.id;
      lastCursor = cursor;
    }

    return {
      data: customerUnifieds,
      nextCursor,
      lastCursor,
      hasNextPage: nextCursor !== null,
    };
  }

  async unifiedCustomerId(organization: string, id: number) {
    try {
      const customerUnified = await this.prisma.customerUnified.findFirst({
        where: {
          id: Number(id),
          organization_id: String(organization),
        },
        include: {
          addresses: true,
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
        },
      });

      const customersIds = await this.prisma.customer_CustomerUnified.findMany({
        where: {
          customer_unified_id: customerUnified.id,
        },
        select: {
          customer_id: true,
        },
      });
      const customerOriginal = await this.prisma.customer.findMany({
        where: {
          id: {
            in: customersIds.map((c) => Number(c.customer_id)),
          },
          organization_id: String(organization),
        },
        include: {
          Source: true,
          addresses: true,
        },
      });
      return {
        CustomerUnified: customerUnified,
        CustomersOriginal: customerOriginal,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAllProductsCustomer(
    organization: string,
    id: number,
    page = 1,
    limit = 10,
    orderBy: 'quantity' | 'total' = 'quantity',
    order: 'asc' | 'desc' = 'desc',
  ) {
    try {
      const products = await this.prisma.order.findMany({
        select: {
          order_items: {
            select: {
              name: true,
              sku: true,
              quantity: true,
              total: true,
            },
          },
        },
        where: {
          customer_unified_id: Number(id),
        },
      });

      // Flatten e agregação por SKU
      const itemMap = new Map<
        string,
        { sku: string; name: string; quantity: number; total: number }
      >();

      for (const order of products) {
        for (const item of order.order_items) {
          const key = item.sku;
          const existing = itemMap.get(key);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total += item.total;
          } else {
            itemMap.set(key, {
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              total: item.total,
            });
          }
        }
      }

      const aggregatedItems = Array.from(itemMap.values()).map((item) => ({
        ...item,
        average_price: item.quantity > 0 ? item.total / item.quantity : 0,
      }));

      // Ordenação conforme parâmetros orderBy e order
      aggregatedItems.sort((a, b) => {
        const fieldA = a[orderBy];
        const fieldB = b[orderBy];
        return order === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      });

      // Paginação baseada em aggregatedItems
      const totalItems = aggregatedItems.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = aggregatedItems.slice(
        startIndex,
        startIndex + limit,
      );

      return {
        data: paginatedItems,
        pageInfo: {
          totalItems,
          currentPage: page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async validate() {
    try {
      console.log('obter lista');
      this.unifyExactDuplicates();
      console.log('finalizou');
    } catch (error) {
      console.log(error);
    }
  }
}
