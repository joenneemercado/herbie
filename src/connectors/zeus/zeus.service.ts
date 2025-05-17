import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  CreateZeusArraySchema,
  CreateZeusSchema,
} from './dto/create-zeus-schema';
import { ZeusConstantes } from './zeus.constantes';
import {
  CreateInteractionAcumularZeusSchema,
  CreateInteractionResgatarZeusSchema,
} from './dto/interaction-zeus.schema';

@Injectable()
export class ZeusService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createZeusDto: CreateZeusSchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub } = await this.jwtService.decode(token);
      const {
        organization_id,
        name,
        phone,
        cpf,
        cnpj,
        email,
        date_birth,
        marital_status,
        gender,
        date_of_inclusion,
        address: {
          postal_code,
          street,
          complement,
          city,
          neighborhood,
          number,
          state,
          country,
        },
      } = createZeusDto;

      const userCustumer = await this.prisma.customer.findFirst({
        where: {
          OR: [{ cpf: cpf }, { cnpj: cnpj }],
          organization_id: organization_id,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
        },
      });
      if (userCustumer) {
        return {
          code: 409,
          success: false,
          message: 'Customer exists',
        };
      }

      const firstName = name?.split(' ')[0];
      const lastName = name?.split(' ').slice(1).join(' ') || null;

      const customer = await this.prisma.customer.create({
        data: {
          organization_id: organization_id,
          firstname: firstName,
          lastname: lastName,
          nickname: null,
          email: email,
          phone: phone,
          cpf: cpf,
          cnpj: cnpj,
          company_name: null,
          trading_name: null,
          date_birth: date_birth,
          marital_status: marital_status,
          gender: gender,
          created_by: sub,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
          addresses: {
            create: {
              organization_id,
              postal_code,
              street,
              number,
              city,
              neighborhood,
              state,
              complement,
              country,
            },
          },
        },
      });

      await this.prisma.interaction.create({
        data: {
          details: createZeusDto,
          organization_id: organization_id,
          customer_id: customer.id,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
          event_id: ZeusConstantes.EVENT_ID_CADASTRO, //cadastro
          type: ZeusConstantes.EVENT_TYPE_CADASTRO,
          total: null,
          created_by: sub,
          status_id: ZeusConstantes.STATUS_ID,
        },
      });

      return {
        code: HttpStatus.CREATED,
        success: true,
        message: 'Cliente cadastrados com sucesso',
        //message:"sucess"
      };
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async createListCustumers(
    createZeusDto: CreateZeusArraySchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      const { sub } = await this.jwtService.decode(token);
      const dados = [];
      for (const dto of createZeusDto) {
        const firstName = dto.name?.split(' ')[0];
        const lastName = dto.name?.split(' ').slice(1).join(' ') || null;
        const data = {
          organization_id: dto.organization_id,
          firstname: firstName,
          lastname: lastName,
          nickname: null,
          email: dto.email,
          phone: dto.phone,
          cpf: dto.cpf,
          cnpj: null,
          company_name: null,
          trading_name: null,
          date_birth: dto.date_birth,
          marital_status: dto.marital_status,
          gender: dto.gender,
          created_by: sub,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
        };
        dados.push(data);
      }
      const dadosEnderecos = [];
      await this.prisma.$transaction(async (trx) => {
        const createCustomer = await trx.customer.createManyAndReturn({
          select: { public_id: true, cpf: true },
          data: dados,
          skipDuplicates: true,
        });
        for (const dto of createZeusDto) {
          const data = {
            customer_id: createCustomer.find((c) => c.cpf === dto.cpf)
              ?.public_id,
            organization_id: dto.organization_id,
            postal_code: dto.address.postal_code,
            street: dto.address.street,
            number: dto.address.number,
            city: dto.address.city,
            neighborhood: dto.address.neighborhood,
            state: dto.address.state,
            complement: dto.address.complement,
            country: dto.address.country,
          };
          if (!data.customer_id) {
            continue;
          }
          dadosEnderecos.push(data);
        }
        await trx.address.createMany({
          data: dadosEnderecos,
          skipDuplicates: true,
        });
      });
      return {
        code: HttpStatus.CREATED,
        success: true,
        message: 'Clientes cadastrados com sucesso',
        //message:"sucess"
      };
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async interationAcumularPontos(
    createInteractionDto: CreateInteractionAcumularZeusSchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub } = await this.jwtService.decode(token);

      const orFilters = [];

      if (createInteractionDto.cpf) {
        orFilters.push({
          details: {
            path: ['cpf'],
            equals: createInteractionDto.cpf,
          },
        });
      }

      if (createInteractionDto.cnpj) {
        orFilters.push({
          details: {
            path: ['cnpj'],
            equals: createInteractionDto.cnpj,
          },
        });
      }

      const findCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { cpf: createInteractionDto.cpf },
            { cnpj: createInteractionDto.cnpj },
          ],
          organization_id: createInteractionDto.organization_id,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
        },
      });
      //console.log(findCustomer);
      if (!findCustomer) {
        return {
          code: 404,
          success: false,
          message: 'Customer not found',
        };
      }

      const findCustomerUnified = await this.prisma.customerUnified.findFirst({
        where: {
          OR: [
            { cpf: createInteractionDto.cpf },
            { cnpj: createInteractionDto.cnpj },
          ],
          organization_id: createInteractionDto.organization_id,
        },
      });

      const findOrganizationId = await this.prisma.organization.findFirst({
        where: {
          public_id: createInteractionDto.organization_id,
        },
      });

      const findSeller = await this.prisma.seller.findFirst({
        where: {
          organization_id: createInteractionDto.organization_id,
          seller_ref: createInteractionDto.details.loja,
        },
      });

      const findOrder = await this.prisma.order.findFirst({
        where: {
          organization_id: findOrganizationId.id,
          order_ref: createInteractionDto.details.idVenda,
          seller_id: findSeller.id,
        },
      });

      if (!findSeller) {
        try {
          await this.prisma.seller.create({
            data: {
              organization_id: createInteractionDto.organization_id,
              seller_ref: createInteractionDto.details.loja,
              name: createInteractionDto.details.rede,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (findCustomerUnified) {
        const findInteraction = await this.prisma.interaction.findFirst({
          where: {
            organization_id: createInteractionDto.organization_id,
            customer_unified_id: findCustomerUnified.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
            OR: orFilters,
            AND: [
              {
                details: {
                  path: ['details', 'idVenda'], // Caminho correto para acessar "loja" dentro de "details"
                  equals: createInteractionDto.details.idVenda,
                },
              },
              {
                details: {
                  path: ['details', 'dataVenda'], // Caminho correto para acessar "dataVenda" dentro de "details"
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'loja'], // Caminho correto para acessar "loja" dentro de "details"
                  equals: createInteractionDto.details.loja,
                },
              },
              {
                details: {
                  path: ['details', 'rede'], // Caminho correto para acessar "rede" dentro de "details"
                  equals: createInteractionDto.details.rede,
                },
              },
            ],
          },
        });
        if (!findInteraction) {
          try {
            await this.prisma.interaction.create({
              data: {
                details: createInteractionDto,
                organization_id: createInteractionDto.organization_id,
                customer_unified_id: findCustomerUnified.id,
                source_id: ZeusConstantes.SOURCE_ID_ZEUS,
                event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
                type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
                total: createInteractionDto.total,
                created_by: sub,
                status_id: ZeusConstantes.STATUS_ID,
              },
            });
          } catch (error) {
            console.log('error', error);
          }
        } else if (!findOrder) {
          try {
            const createOrder = await this.prisma.order.create({
              data: {
                organization_id: findOrganizationId.id,
                customer_unified_id: findCustomerUnified.id,
                order_ref: createInteractionDto.details.idVenda,
                seller_id: findSeller.id,
                total: createInteractionDto.details.vlCupom,
                user_id: sub,
                order_date: new Date(createInteractionDto.details.dataVenda),
                subtotal: createInteractionDto.details.vlCupom,
                total_items: createInteractionDto.details.vlCupom,
              },
            });
            for (const item of createInteractionDto.details.produtos) {
              await this.prisma.orderItem.create({
                data: {
                  order_id: createOrder.id,
                  name: item.descricao,
                  quantity: item.quantidade,
                  price: item.valor,
                  sku: item.codigo,
                  ean: item.codigoEAN,
                  total: item.valor,
                },
              });
            }
          } catch (error) {
            console.log('error', error);
          }
        }
        return {
          code: HttpStatus.CREATED,
          success: true,
          message: 'Event created successfully',
          //message:"sucess"
        };
      } else {
        const findInteraction = await this.prisma.interaction.findFirst({
          where: {
            organization_id: createInteractionDto.organization_id,
            customer_id: findCustomer.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
            OR: orFilters,
            AND: [
              {
                details: {
                  path: ['details', 'idVenda'], // Caminho correto para acessar "loja" dentro de "details"
                  equals: createInteractionDto.details.idVenda,
                },
              },
              {
                details: {
                  path: ['details', 'dataVenda'], // Caminho correto para acessar "dataVenda" dentro de "details"
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'loja'], // Caminho correto para acessar "loja" dentro de "details"
                  equals: createInteractionDto.details.loja,
                },
              },
              {
                details: {
                  path: ['details', 'rede'], // Caminho correto para acessar "rede" dentro de "details"
                  equals: createInteractionDto.details.rede,
                },
              },
            ],
          },
        });
        if (!findInteraction) {
          try {
            await this.prisma.interaction.create({
              data: {
                details: createInteractionDto,
                organization_id: createInteractionDto.organization_id,
                customer_id: findCustomer.id,
                source_id: ZeusConstantes.SOURCE_ID_ZEUS,
                event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
                type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
                total: createInteractionDto.total,
                created_by: sub,
                status_id: ZeusConstantes.STATUS_ID,
              },
            });
          } catch (error) {
            console.log(error);
          }
        } else if (!findOrder) {
          try {
            const createOrder = await this.prisma.order.create({
              data: {
                organization_id: findOrganizationId.id,
                customer_id: findCustomer.id,
                order_ref: createInteractionDto.details.idVenda,
                seller_id: findSeller.id,
                total: createInteractionDto.details.vlCupom,
                user_id: sub,
                order_date: new Date(createInteractionDto.details.dataVenda),
                subtotal: createInteractionDto.details.vlCupom,
                total_items: createInteractionDto.details.vlCupom,
              },
            });
            for (const item of createInteractionDto.details.produtos) {
              await this.prisma.orderItem.create({
                data: {
                  order_id: createOrder.id,
                  name: item.descricao,
                  quantity: item.quantidade,
                  price: item.valor,
                  sku: item.codigo,
                  ean: item.codigoEAN,
                  total: item.valor,
                },
              });
            }
          } catch (error) {
            console.log(error);
          }
        }

        return {
          code: HttpStatus.CREATED,
          success: true,
          message: 'Event created successfully',
          //message:"sucess"
        };
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async interationResgatarPontos(
    createInteractionDto: CreateInteractionResgatarZeusSchema,
    req: Request,
  ) {
    //TODO JSON QUE EU ENVIEI
    // {
    //   "organization_id": "cm0l1u61r00003b6junq2pmbi",
    //   "cpf": "02525273214",
    //   "total": 250.75,
    //   "details": {
    //     "vlDisponivel": 1000,
    //     "dataVenda": "2024-05-10T12:30:00.000Z",
    //     "loja": "Loja 1",
    //     "vlCash": 250.75,
    //     "primeiraCompra": true,
    //     "rede": "Rede 1",
    //     "tipoPessoa": "F"
    //   }
    // }

    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub } = await this.jwtService.decode(token);

      const findCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { cpf: createInteractionDto.cpf },
            { cnpj: createInteractionDto.cnpj },
          ],
          organization_id: createInteractionDto.organization_id,
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
        },
      });
      // console.log(findCustomer);
      if (!findCustomer) {
        return {
          code: 404,
          success: false,
          message: 'Customer not found',
        };
      }

      const orFilters = [];

      if (createInteractionDto.cpf) {
        orFilters.push({
          details: {
            path: ['cpf'],
            equals: createInteractionDto.cpf,
          },
        });
      }

      if (createInteractionDto.cnpj) {
        orFilters.push({
          details: {
            path: ['cnpj'],
            equals: createInteractionDto.cnpj,
          },
        });
      }

      const findCustomerUnified = await this.prisma.customerUnified.findFirst({
        where: {
          OR: [
            { cpf: createInteractionDto.cpf },
            { cnpj: createInteractionDto.cnpj },
          ],
          organization_id: createInteractionDto.organization_id,
        },
      });
      //console.log(findCustomerUnified);

      if (findCustomer && findCustomerUnified) {
        const findInteraction = await this.prisma.interaction.findFirst({
          where: {
            organization_id: createInteractionDto.organization_id,
            customer_unified_id: findCustomerUnified.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_RESGATAR,
            type: ZeusConstantes.EVENT_TYPE_RESGATAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
            OR: orFilters,
            AND: [
              {
                details: {
                  path: ['details', 'dataVenda'],
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'vlCash'],
                  equals: createInteractionDto.details.vlCash,
                },
              },
              {
                details: {
                  path: ['details', 'loja'],
                  equals: createInteractionDto.details.loja,
                },
              },
              {
                details: {
                  path: ['details', 'rede'],
                  equals: createInteractionDto.details.rede,
                },
              },
            ],
          },
        });
        //console.log(findInteraction);
        if (findInteraction) {
          throw new Error('Interacao de resgatar já existe');
        }
        await this.prisma.interaction.create({
          data: {
            details: createInteractionDto,
            organization_id: createInteractionDto.organization_id,
            customer_unified_id: findCustomerUnified.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_RESGATAR,
            type: ZeusConstantes.EVENT_TYPE_RESGATAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
          },
        });
        //console.log('creatInteractionAcumular', creatInteractionAcumular);
        return {
          code: HttpStatus.CREATED,
          success: true,
          message: 'Event created successfully',
          //message:"sucess"
        };
      } else {
        const findInteraction = await this.prisma.interaction.findFirst({
          where: {
            organization_id: createInteractionDto.organization_id,
            customer_id: findCustomer.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_RESGATAR,
            type: ZeusConstantes.EVENT_TYPE_RESGATAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
            OR: orFilters,
            AND: [
              {
                details: {
                  path: ['details', 'dataVenda'],
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'vlCash'],
                  equals: createInteractionDto.details.vlCash,
                },
              },
              {
                details: {
                  path: ['details', 'loja'],
                  equals: createInteractionDto.details.loja,
                },
              },
              {
                details: {
                  path: ['details', 'rede'],
                  equals: createInteractionDto.details.rede,
                },
              },
            ],
          },
        });
        // console.log(findInteraction);
        if (findInteraction) {
          throw new Error('Interacao de resgatar já existe');
        }

        await this.prisma.interaction.create({
          data: {
            details: createInteractionDto,
            organization_id: createInteractionDto.organization_id,
            customer_id: findCustomer.id,
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_RESGATAR,
            type: ZeusConstantes.EVENT_TYPE_RESGATAR,
            total: createInteractionDto.total,
            created_by: sub,
            status_id: ZeusConstantes.STATUS_ID,
          },
        });
        //console.log('creatInteractionAcumular', creatInteractionAcumular);
        return {
          code: HttpStatus.CREATED,
          success: true,
          message: 'Event created successfully',
          //message:"sucess"
        };
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
}
