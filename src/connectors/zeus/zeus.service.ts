import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { Prisma } from '@prisma/client';
import {
  genderMap,
  getNormalizedValue,
  maritalStatusMap,
} from '@src/app.utils';

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

      const normalizedGender = getNormalizedValue(gender, genderMap);
      const normalizedMaritalStatus = getNormalizedValue(
        marital_status,
        maritalStatusMap,
      );

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
          marital_status: normalizedMaritalStatus ?? null,
          gender: normalizedGender ?? null,
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
        const normalizedGender = getNormalizedValue(dto.gender, genderMap);
        const normalizedMaritalStatus = getNormalizedValue(
          dto.marital_status,
          maritalStatusMap,
        );
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
          marital_status: normalizedMaritalStatus,
          gender: normalizedGender,
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

  // async interationAcumularPontos(
  //   createInteractionDto: CreateInteractionAcumularZeusSchema,
  //   req: Request,
  // ) {
  //   const reqToken = req.headers['authorization'];
  //   if (!reqToken) {
  //     throw new UnauthorizedException();
  //   }
  //   try {
  //     const token = reqToken.split(' ')[1];
  //     //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
  //     const { sub } = await this.jwtService.decode(token);

  //     const orFilters = [];

  //     if (createInteractionDto.cpf) {
  //       orFilters.push({
  //         details: {
  //           path: ['cpf'],
  //           equals: createInteractionDto.cpf,
  //         },
  //       });
  //     }

  //     if (createInteractionDto.cnpj) {
  //       orFilters.push({
  //         details: {
  //           path: ['cnpj'],
  //           equals: createInteractionDto.cnpj,
  //         },
  //       });
  //     }

  //     const findCustomer = await this.prisma.customer.findFirst({
  //       where: {
  //         OR: [
  //           { cpf: createInteractionDto.cpf },
  //           { cnpj: createInteractionDto.cnpj },
  //         ],
  //         organization_id: createInteractionDto.organization_id,
  //         source_id: ZeusConstantes.SOURCE_ID_ZEUS,
  //       },
  //     });
  //     //console.log(findCustomer);
  //     if (!findCustomer) {
  //       return {
  //         code: 404,
  //         success: false,
  //         message: 'Customer not found',
  //       };
  //     }

  //     const findCustomerUnified = await this.prisma.customerUnified.findFirst({
  //       where: {
  //         OR: [
  //           { cpf: createInteractionDto.cpf },
  //           { cnpj: createInteractionDto.cnpj },
  //         ],
  //         organization_id: createInteractionDto.organization_id,
  //       },
  //     });

  //     const findOrganizationId = await this.prisma.organization.findFirst({
  //       where: {
  //         public_id: createInteractionDto.organization_id,
  //       },
  //     });

  //     const findSeller = await this.prisma.seller.findFirst({
  //       where: {
  //         organization_id: createInteractionDto.organization_id,
  //         seller_ref: createInteractionDto.details.loja,
  //       },
  //     });

  //     const findOrder = await this.prisma.order.findFirst({
  //       where: {
  //         organization_id: findOrganizationId.public_id,
  //         order_ref: createInteractionDto.details.idVenda,
  //         seller_id: findSeller.id,
  //       },
  //     });

  //     if (!findSeller) {
  //       try {
  //         await this.prisma.seller.create({
  //           data: {
  //             organization_id: createInteractionDto.organization_id,
  //             seller_ref: createInteractionDto.details.loja,
  //             name: createInteractionDto.details.rede,
  //             created_at: new Date(),
  //             updated_at: new Date(),
  //           },
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }

  //     if (findCustomerUnified) {
  //       const findInteraction = await this.prisma.interaction.findFirst({
  //         where: {
  //           organization_id: createInteractionDto.organization_id,
  //           customer_unified_id: findCustomerUnified.id,
  //           source_id: ZeusConstantes.SOURCE_ID_ZEUS,
  //           event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
  //           type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
  //           total: createInteractionDto.total,
  //           created_by: sub,
  //           status_id: ZeusConstantes.STATUS_ID,
  //           OR: orFilters,
  //           AND: [
  //             {
  //               details: {
  //                 path: ['details', 'idVenda'], // Caminho correto para acessar "loja" dentro de "details"
  //                 equals: createInteractionDto.details.idVenda,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'dataVenda'], // Caminho correto para acessar "dataVenda" dentro de "details"
  //                 equals: createInteractionDto.details.dataVenda,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'loja'], // Caminho correto para acessar "loja" dentro de "details"
  //                 equals: createInteractionDto.details.loja,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'rede'], // Caminho correto para acessar "rede" dentro de "details"
  //                 equals: createInteractionDto.details.rede,
  //               },
  //             },
  //           ],
  //         },
  //       });
  //       if (!findInteraction) {
  //         try {
  //           await this.prisma.interaction.create({
  //             data: {
  //               details: createInteractionDto,
  //               organization_id: createInteractionDto.organization_id,
  //               customer_unified_id: findCustomerUnified.id,
  //               source_id: ZeusConstantes.SOURCE_ID_ZEUS,
  //               event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
  //               type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
  //               total: createInteractionDto.total,
  //               created_by: sub,
  //               status_id: ZeusConstantes.STATUS_ID,
  //             },
  //           });
  //         } catch (error) {
  //           console.log('error', error);
  //         }
  //       } else if (!findOrder) {
  //         try {
  //           const createOrder = await this.prisma.order.create({
  //             data: {
  //               organization_id: findOrganizationId.public_id,
  //               customer_unified_id: findCustomerUnified.id,
  //               order_ref: createInteractionDto.details.idVenda,
  //               seller_id: findSeller.id,
  //               total: createInteractionDto.details.vlCupom,
  //               user_id: sub,
  //               order_date: new Date(createInteractionDto.details.dataVenda),
  //               subtotal: createInteractionDto.details.vlCupom,
  //               total_items: createInteractionDto.details.vlCupom,
  //             },
  //           });
  //           for (const item of createInteractionDto.details.produtos) {
  //             await this.prisma.orderItem.create({
  //               data: {
  //                 order_id: createOrder.id,
  //                 name: item.descricao,
  //                 quantity: item.quantidade,
  //                 price: item.valor,
  //                 sku: item.codigo,
  //                 ean: item.codigoEAN,
  //                 total: item.valor,
  //               },
  //             });
  //           }
  //         } catch (error) {
  //           console.log('error', error);
  //         }
  //       }
  //       return {
  //         code: HttpStatus.CREATED,
  //         success: true,
  //         message: 'Event created successfully',
  //         //message:"sucess"
  //       };
  //     } else {
  //       const findInteraction = await this.prisma.interaction.findFirst({
  //         where: {
  //           organization_id: createInteractionDto.organization_id,
  //           customer_id: findCustomer.id,
  //           source_id: ZeusConstantes.SOURCE_ID_ZEUS,
  //           event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
  //           type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
  //           total: createInteractionDto.total,
  //           created_by: sub,
  //           status_id: ZeusConstantes.STATUS_ID,
  //           OR: orFilters,
  //           AND: [
  //             {
  //               details: {
  //                 path: ['details', 'idVenda'], // Caminho correto para acessar "loja" dentro de "details"
  //                 equals: createInteractionDto.details.idVenda,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'dataVenda'], // Caminho correto para acessar "dataVenda" dentro de "details"
  //                 equals: createInteractionDto.details.dataVenda,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'loja'], // Caminho correto para acessar "loja" dentro de "details"
  //                 equals: createInteractionDto.details.loja,
  //               },
  //             },
  //             {
  //               details: {
  //                 path: ['details', 'rede'], // Caminho correto para acessar "rede" dentro de "details"
  //                 equals: createInteractionDto.details.rede,
  //               },
  //             },
  //           ],
  //         },
  //       });
  //       if (!findInteraction) {
  //         try {
  //           await this.prisma.interaction.create({
  //             data: {
  //               details: createInteractionDto,
  //               organization_id: createInteractionDto.organization_id,
  //               customer_id: findCustomer.id,
  //               source_id: ZeusConstantes.SOURCE_ID_ZEUS,
  //               event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
  //               type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
  //               total: createInteractionDto.total,
  //               created_by: sub,
  //               status_id: ZeusConstantes.STATUS_ID,
  //             },
  //           });
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       } else if (!findOrder) {
  //         try {
  //           const createOrder = await this.prisma.order.create({
  //             data: {
  //               organization_id: findOrganizationId.public_id,
  //               customer_id: findCustomer.id,
  //               order_ref: createInteractionDto.details.idVenda,
  //               seller_id: findSeller.id,
  //               total: createInteractionDto.details.vlCupom,
  //               user_id: sub,
  //               order_date: new Date(createInteractionDto.details.dataVenda),
  //               subtotal: createInteractionDto.details.vlCupom,
  //               total_items: createInteractionDto.details.vlCupom,
  //             },
  //           });
  //           for (const item of createInteractionDto.details.produtos) {
  //             await this.prisma.orderItem.create({
  //               data: {
  //                 order_id: createOrder.id,
  //                 name: item.descricao,
  //                 quantity: item.quantidade,
  //                 price: item.valor,
  //                 sku: item.codigo,
  //                 ean: item.codigoEAN,
  //                 total: item.valor,
  //               },
  //             });
  //           }
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }

  //       return {
  //         code: HttpStatus.CREATED,
  //         success: true,
  //         message: 'Event created successfully',
  //         //message:"sucess"
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     throw error;
  //   }
  // }

  async interationAcumularPontos(
    createInteractionDto: CreateInteractionAcumularZeusSchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    //const token = reqToken.split(' ')[1];
    //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
    const token = reqToken.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      sub: number;
      org: string;
    };

    const systemUserId = decodedToken.sub; // ID do usuário que está realizando a ação

    // ---- INÍCIO DA TRANSAÇÃO ----
    return this.prisma.$transaction(
      async (tx) => {
        // 1. BUSCAR/VERIFICAR ENTIDADES EXISTENTES
        const organization = await tx.organization.findUnique({
          where: { public_id: createInteractionDto.organization_id },
        });
        if (!organization) {
          throw new NotFoundException(
            `Organização com ID ${createInteractionDto.organization_id} não encontrada.`,
          );
        }

        let customerId: number | undefined; // customer.id (PK)
        let customerUnifiedId: number | undefined; // customer_unified.id (PK)

        const customerWhereOr: Prisma.CustomerWhereInput[] = [];
        if (createInteractionDto.cpf)
          customerWhereOr.push({ cpf: createInteractionDto.cpf });
        if (createInteractionDto.cnpj)
          customerWhereOr.push({ cnpj: createInteractionDto.cnpj });

        if (customerWhereOr.length === 0) {
          throw new Error('CPF ou CNPJ do cliente deve ser fornecido.'); // Ou Bad Request
        }

        // Priorizar CustomerUnified
        const findCustomerUnified = await tx.customerUnified.findFirst({
          where: {
            OR: customerWhereOr.map((condition) => ({
              ...condition,
              organization_id: organization.public_id,
            })) as Prisma.CustomerUnifiedWhereInput[],
          },
        });

        if (findCustomerUnified) {
          customerUnifiedId = findCustomerUnified.id;
        } else {
          const findCustomer = await tx.customer.findFirst({
            where: {
              OR: customerWhereOr.map((condition) => ({
                ...condition,
                organization_id: organization.public_id,
                source_id: ZeusConstantes.SOURCE_ID_ZEUS, // Cliente deve ser da fonte ZEUS se não unificado
              })),
            },
          });
          if (!findCustomer) {
            // Para "acumular pontos", o cliente já deve existir (unificado ou da fonte Zeus)
            // Não vamos criar um novo cliente aqui, pois o fluxo é de acumulação.
            throw new NotFoundException(
              'Cliente não encontrado para CPF/CNPJ fornecido na organização e fonte Zeus.',
            );
          }
          customerId = findCustomer.id;
        }

        // 2. BUSCAR OU CRIAR SELLER (VENDEDOR/LOJA)
        let seller = await tx.seller.findFirst({
          where: {
            organization_id: organization.public_id,
            seller_ref: createInteractionDto.details.loja, // 'loja' é a referência do seller
          },
        });

        if (!seller) {
          seller = await tx.seller.create({
            data: {
              organization: { connect: { public_id: organization.public_id } },
              seller_ref: createInteractionDto.details.loja,
              name: createInteractionDto.details.rede, // 'rede' pode ser o nome do seller
              // created_at e updated_at são gerenciados pelo Prisma (@default(now()) @updatedAt)
            },
          });
        }

        // 3. VERIFICAR SE INTERAÇÃO JÁ EXISTE (Lógica de idempotência)
        const interactionOrFilters: Prisma.InteractionWhereInput[] = [];
        if (createInteractionDto.cpf) {
          interactionOrFilters.push({
            details: { path: ['cpf'], equals: createInteractionDto.cpf },
          });
        }
        if (createInteractionDto.cnpj) {
          interactionOrFilters.push({
            details: { path: ['cnpj'], equals: createInteractionDto.cnpj },
          });
        }

        const existingInteraction = await tx.interaction.findFirst({
          where: {
            organization_id: organization.public_id,
            customer_unified_id: customerUnifiedId, // Será undefined se não houver customerUnified
            customer_id: customerId, // Será undefined se houver customerUnified ou nenhum customer
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_ACUMULAR, // Assumindo que é um campo escalar
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR, // Assumindo que é um campo escalar
            // Se event_id, type, source_id, status_id, created_by forem RELAÇÕES, use `connect` na criação e ajuste a busca
            // created_by: systemUserId, // Se 'created_by' for escalar
            // status_id: ZeusConstantes.STATUS_ID, // Se 'status_id' for escalar

            // Condições mais específicas para idempotência baseadas no payload da interação
            AND: [
              {
                details: {
                  path: ['details', 'idVenda'],
                  equals: createInteractionDto.details.idVenda,
                },
              },
              {
                details: {
                  path: ['details', 'dataVenda'],
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'loja'],
                  equals: createInteractionDto.details.loja,
                },
              },
            ],
            // OR: interactionOrFilters, // Descomente se a busca por cpf/cnpj no details da interação for necessária
          },
        });

        if (existingInteraction) {
          // Se a interação já existe, podemos considerar que o pedido associado também já foi processado.
          // Poderia retornar um status de conflito ou simplesmente sucesso indicando que já foi processado.
          console.log(
            `Interação para idVenda ${createInteractionDto.details.idVenda} já existe.`,
          );
          // return { // Removido para permitir a criação do pedido se ele não existir.
          //   code: HttpStatus.OK, // Ou CONFLICT
          //   success: true,
          //   message: 'Interação já processada anteriormente.',
          //   interactionId: existingInteraction.id
          // };
        }

        // 4. CRIAR INTERAÇÃO SE NÃO EXISTIR
        let newInteractionId: number | undefined;
        if (!existingInteraction) {
          const interactionData: Prisma.InteractionCreateInput = {
            details: createInteractionDto as any, // O DTO inteiro como detalhe
            total: createInteractionDto.total, // Pontos a acumular
            organization: { connect: { public_id: organization.public_id } },
            // Assumindo que event_id, type, source_id, status_id, created_by são campos escalares
            // Se forem relações, precisa usar a sintaxe de `connect` como fizemos para `organization`
            event: {
              connect: { id: ZeusConstantes.EVENT_ID_ACUMULAR }, // Assumindo que
            },
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
            Source: {
              connect: { id: ZeusConstantes.SOURCE_ID_ZEUS },
            },
            Status: {
              connect: { id: ZeusConstantes.STATUS_ID },
            },
            created_by: systemUserId, // Conectando 'created_by' à tabela User
          };

          if (customerUnifiedId) {
            interactionData.CustomerUnified = {
              connect: { id: customerUnifiedId },
            };
          } else if (customerId) {
            interactionData.Customer = { connect: { id: customerId } }; // Conecta pelo PK do Customer
          }

          const createdInteraction = await tx.interaction.create({
            data: interactionData,
          });
          newInteractionId = createdInteraction.id;
          console.log(`Interação ${newInteractionId} criada.`);
        }

        // 5. VERIFICAR/CRIAR ORDER E ORDER_ITEMS
        // O pedido só deve ser criado se a interação foi criada agora OU se ela já existia mas o pedido não.
        // E apenas se houver um cliente (unificado ou não) identificado.
        if (customerUnifiedId || customerId) {
          let order = await tx.order.findFirst({
            where: {
              organization_id: organization.public_id,
              order_ref: createInteractionDto.details.idVenda,
              seller_id: seller.id,
            },
          });

          if (!order) {
            const orderData: Prisma.OrderCreateInput = {
              order_ref: createInteractionDto.details.idVenda,
              order_date: new Date(createInteractionDto.details.dataVenda), // Certifique-se que o formato é válido
              total: Math.round(createInteractionDto.details.vlCupom * 100), // CONVERTER PARA CENTAVOS
              subtotal: Math.round(createInteractionDto.details.vlCupom * 100), // CONVERTER PARA CENTAVOS
              total_items: createInteractionDto.details.produtos.reduce(
                (sum, p) => sum + p.quantidade,
                0,
              ),
              organization: { connect: { public_id: organization.public_id } },
              seller: { connect: { id: seller.id } },
              user: { connect: { id: systemUserId } }, // Usuário que registrou o pedido no sistema
            };

            if (customerUnifiedId) {
              orderData.CustomerUnified = {
                connect: { id: customerUnifiedId },
              };
            } else if (customerId) {
              orderData.Customer = { connect: { id: customerId } }; // Conecta pelo PK do Customer
            }

            const createdOrder = await tx.order.create({
              data: {
                ...orderData,
                order_items: {
                  createMany: {
                    data: createInteractionDto.details.produtos.map((item) => {
                      const quantity = item.quantidade;
                      const totalValueForItemLine = item.valor; // Valor total para a linha do item
                      const unitPrice =
                        quantity > 0 ? totalValueForItemLine / quantity : 0;

                      return {
                        name: item.descricao,
                        quantity: quantity,
                        price: Math.round(unitPrice * 100), // Preço unitário em CENTAVOS
                        total: Math.round(totalValueForItemLine * 100), // Total da linha em CENTAVOS
                        sku: item.codigo,
                        ean: item.codigoEAN,
                      };
                    }),
                  },
                },
              },
            });
            order = createdOrder; // Atualiza a variável order com o pedido criado
            console.log(
              `Pedido ${order.id} criado para idVenda ${createInteractionDto.details.idVenda}.`,
            );
          } else {
            console.log(
              `Pedido ${order.id} para idVenda ${createInteractionDto.details.idVenda} já existia.`,
            );
          }
        } else {
          // Este caso não deveria ocorrer se a lógica de busca de cliente estiver correta
          // e lançar NotFoundException antes.
          console.warn(
            'Nenhum cliente identificado, pedido não será criado/verificado.',
          );
        }

        return {
          code:
            existingInteraction && !newInteractionId
              ? HttpStatus.OK
              : HttpStatus.CREATED,
          success: true,
          message:
            existingInteraction && !newInteractionId
              ? 'Interação já processada anteriormente.'
              : 'Interação e/ou pedido processado com sucesso.',
          interactionId: existingInteraction?.id || newInteractionId,
        };
      },
      {
        maxWait: 15000, // Tempo máximo que o Prisma Client aguardará para adquirir uma conexão do pool
        timeout: 30000, // Tempo máximo que a transação interativa pode ser executada
      },
    ); // ---- FIM DA TRANSAÇÃO ----
  }

  async INTERNO_NAO_USAR_NO_CONTROLLER_interationAcumularPontos(
    createInteractionDto: CreateInteractionAcumularZeusSchema,
    user_id: number,
  ) {
    if (!user_id) {
      throw new HttpException('Faltou usuario', 409);
    }
    const systemUserId = user_id; // ID do usuário que está realizando a ação

    // ---- INÍCIO DA TRANSAÇÃO ----
    return this.prisma.$transaction(
      async (tx) => {
        // 1. BUSCAR/VERIFICAR ENTIDADES EXISTENTES
        const organization = await tx.organization.findUnique({
          where: { public_id: createInteractionDto.organization_id },
        });
        if (!organization) {
          throw new NotFoundException(
            `Organização com ID ${createInteractionDto.organization_id} não encontrada.`,
          );
        }

        let customerId: number | undefined; // customer.id (PK)
        let customerUnifiedId: number | undefined; // customer_unified.id (PK)

        const customerWhereOr: Prisma.CustomerWhereInput[] = [];
        if (createInteractionDto.cpf)
          customerWhereOr.push({ cpf: createInteractionDto.cpf });
        if (createInteractionDto.cnpj)
          customerWhereOr.push({ cnpj: createInteractionDto.cnpj });

        if (customerWhereOr.length === 0) {
          throw new Error('CPF ou CNPJ do cliente deve ser fornecido.'); // Ou Bad Request
        }

        // Priorizar CustomerUnified
        const findCustomerUnified = await tx.customerUnified.findFirst({
          where: {
            OR: customerWhereOr.map((condition) => ({
              ...condition,
              organization_id: organization.public_id,
            })) as Prisma.CustomerUnifiedWhereInput[],
          },
        });

        if (findCustomerUnified) {
          customerUnifiedId = findCustomerUnified.id;
        } else {
          const findCustomer = await tx.customer.findFirst({
            where: {
              OR: customerWhereOr.map((condition) => ({
                ...condition,
                organization_id: organization.public_id,
                source_id: ZeusConstantes.SOURCE_ID_ZEUS, // Cliente deve ser da fonte ZEUS se não unificado
              })),
            },
          });
          if (!findCustomer) {
            // Para "acumular pontos", o cliente já deve existir (unificado ou da fonte Zeus)
            // Não vamos criar um novo cliente aqui, pois o fluxo é de acumulação.
            throw new NotFoundException(
              'Cliente não encontrado para CPF/CNPJ fornecido na organização e fonte Zeus.',
            );
          }
          customerId = findCustomer.id;
        }

        // 2. BUSCAR OU CRIAR SELLER (VENDEDOR/LOJA)
        let seller = await tx.seller.findFirst({
          where: {
            organization_id: organization.public_id,
            seller_ref: createInteractionDto.details.loja, // 'loja' é a referência do seller
          },
        });

        if (!seller) {
          seller = await tx.seller.create({
            data: {
              organization: { connect: { public_id: organization.public_id } },
              seller_ref: createInteractionDto.details.loja,
              name: createInteractionDto.details.rede, // 'rede' pode ser o nome do seller
              // created_at e updated_at são gerenciados pelo Prisma (@default(now()) @updatedAt)
            },
          });
        }

        // 3. VERIFICAR SE INTERAÇÃO JÁ EXISTE (Lógica de idempotência)
        const interactionOrFilters: Prisma.InteractionWhereInput[] = [];
        if (createInteractionDto.cpf) {
          interactionOrFilters.push({
            details: { path: ['cpf'], equals: createInteractionDto.cpf },
          });
        }
        if (createInteractionDto.cnpj) {
          interactionOrFilters.push({
            details: { path: ['cnpj'], equals: createInteractionDto.cnpj },
          });
        }

        const existingInteraction = await tx.interaction.findFirst({
          where: {
            organization_id: organization.public_id,
            customer_unified_id: customerUnifiedId, // Será undefined se não houver customerUnified
            customer_id: customerId, // Será undefined se houver customerUnified ou nenhum customer
            source_id: ZeusConstantes.SOURCE_ID_ZEUS,
            event_id: ZeusConstantes.EVENT_ID_ACUMULAR, // Assumindo que é um campo escalar
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR, // Assumindo que é um campo escalar
            // Se event_id, type, source_id, status_id, created_by forem RELAÇÕES, use `connect` na criação e ajuste a busca
            // created_by: systemUserId, // Se 'created_by' for escalar
            // status_id: ZeusConstantes.STATUS_ID, // Se 'status_id' for escalar

            // Condições mais específicas para idempotência baseadas no payload da interação
            AND: [
              {
                details: {
                  path: ['details', 'idVenda'],
                  equals: createInteractionDto.details.idVenda,
                },
              },
              {
                details: {
                  path: ['details', 'dataVenda'],
                  equals: createInteractionDto.details.dataVenda,
                },
              },
              {
                details: {
                  path: ['details', 'loja'],
                  equals: createInteractionDto.details.loja,
                },
              },
            ],
            // OR: interactionOrFilters, // Descomente se a busca por cpf/cnpj no details da interação for necessária
          },
        });

        if (existingInteraction) {
          // Se a interação já existe, podemos considerar que o pedido associado também já foi processado.
          // Poderia retornar um status de conflito ou simplesmente sucesso indicando que já foi processado.
          console.log(
            `Interação para idVenda ${createInteractionDto.details.idVenda} já existe.`,
          );
          // return { // Removido para permitir a criação do pedido se ele não existir.
          //   code: HttpStatus.OK, // Ou CONFLICT
          //   success: true,
          //   message: 'Interação já processada anteriormente.',
          //   interactionId: existingInteraction.id
          // };
        }

        // 4. CRIAR INTERAÇÃO SE NÃO EXISTIR
        let newInteractionId: number | undefined;
        if (!existingInteraction) {
          const interactionData: Prisma.InteractionCreateInput = {
            details: createInteractionDto as any, // O DTO inteiro como detalhe
            total: createInteractionDto.total, // Pontos a acumular
            organization: { connect: { public_id: organization.public_id } },
            // Assumindo que event_id, type, source_id, status_id, created_by são campos escalares
            // Se forem relações, precisa usar a sintaxe de `connect` como fizemos para `organization`
            event: {
              connect: { id: ZeusConstantes.EVENT_ID_ACUMULAR }, // Assumindo que
            },
            type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
            Source: {
              connect: { id: ZeusConstantes.SOURCE_ID_ZEUS },
            },
            Status: {
              connect: { id: ZeusConstantes.STATUS_ID },
            },
            created_by: systemUserId, // Conectando 'created_by' à tabela User
          };

          if (customerUnifiedId) {
            interactionData.CustomerUnified = {
              connect: { id: customerUnifiedId },
            };
          } else if (customerId) {
            interactionData.Customer = { connect: { id: customerId } }; // Conecta pelo PK do Customer
          }

          const createdInteraction = await tx.interaction.create({
            data: interactionData,
          });
          newInteractionId = createdInteraction.id;
          console.log(`Interação ${newInteractionId} criada.`);
        }

        // 5. VERIFICAR/CRIAR ORDER E ORDER_ITEMS
        // O pedido só deve ser criado se a interação foi criada agora OU se ela já existia mas o pedido não.
        // E apenas se houver um cliente (unificado ou não) identificado.
        if (customerUnifiedId || customerId) {
          let order = await tx.order.findFirst({
            where: {
              organization_id: organization.public_id,
              order_ref: createInteractionDto.details.idVenda,
              seller_id: seller.id,
            },
          });

          if (!order) {
            const orderData: Prisma.OrderCreateInput = {
              order_ref: createInteractionDto.details.idVenda,
              order_date: new Date(createInteractionDto.details.dataVenda), // Certifique-se que o formato é válido
              total: Math.round(createInteractionDto.details.vlCupom * 100), // CONVERTER PARA CENTAVOS
              subtotal: Math.round(createInteractionDto.details.vlCupom * 100), // CONVERTER PARA CENTAVOS
              total_items: createInteractionDto.details.produtos.reduce(
                (sum, p) => sum + p.quantidade,
                0,
              ),
              organization: { connect: { public_id: organization.public_id } },
              seller: { connect: { id: seller.id } },
              user: { connect: { id: systemUserId } }, // Usuário que registrou o pedido no sistema
            };

            if (customerUnifiedId) {
              orderData.CustomerUnified = {
                connect: { id: customerUnifiedId },
              };
            } else if (customerId) {
              orderData.Customer = { connect: { id: customerId } }; // Conecta pelo PK do Customer
            }

            const createdOrder = await tx.order.create({
              data: {
                ...orderData,
                order_items: {
                  createMany: {
                    data: createInteractionDto.details.produtos.map((item) => {
                      const quantity = item.quantidade;
                      const totalValueForItemLine = item.valor; // Valor total para a linha do item
                      const unitPrice =
                        quantity > 0 ? totalValueForItemLine / quantity : 0;

                      return {
                        name: item.descricao,
                        quantity: quantity,
                        price: Math.round(unitPrice * 100), // Preço unitário em CENTAVOS
                        total: Math.round(totalValueForItemLine * 100), // Total da linha em CENTAVOS
                        sku: item.codigo,
                        ean: item.codigoEAN,
                      };
                    }),
                  },
                },
              },
            });
            order = createdOrder; // Atualiza a variável order com o pedido criado
            console.log(
              `Pedido ${order.id} criado para idVenda ${createInteractionDto.details.idVenda}.`,
            );
          } else {
            console.log(
              `Pedido ${order.id} para idVenda ${createInteractionDto.details.idVenda} já existia.`,
            );
          }
        } else {
          // Este caso não deveria ocorrer se a lógica de busca de cliente estiver correta
          // e lançar NotFoundException antes.
          console.warn(
            'Nenhum cliente identificado, pedido não será criado/verificado.',
          );
        }

        return {
          code:
            existingInteraction && !newInteractionId
              ? HttpStatus.OK
              : HttpStatus.CREATED,
          success: true,
          message:
            existingInteraction && !newInteractionId
              ? 'Interação já processada anteriormente.'
              : 'Interação e/ou pedido processado com sucesso.',
          interactionId: existingInteraction?.id || newInteractionId,
        };
      },
      {
        maxWait: 15000, // Tempo máximo que o Prisma Client aguardará para adquirir uma conexão do pool
        timeout: 30000, // Tempo máximo que a transação interativa pode ser executada
      },
    ); // ---- FIM DA TRANSAÇÃO ----
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

  async processarInteractionAcumular() {
    try {
      const interactions = await this.prisma.interaction.findMany({
        where: {
          source_id: ZeusConstantes.SOURCE_ID_ZEUS,
          event_id: ZeusConstantes.EVENT_ID_ACUMULAR,
          type: ZeusConstantes.EVENT_TYPE_ACUMULAR,
        },
      });
      console.log('Tamanho da lista: ', interactions.length);
      for (const item of interactions) {
        const interaction = item['details'];
        console.log(interaction['details']['idVenda']);
        console.log(item['details']['organization_id']);
        const nro = interaction['details']['idVenda'];
        console.log(nro);
        //console.log(interaction);
        const order = await this.prisma.order.findFirst({
          where: {
            order_ref: nro,
            organization_id: item['organization_id'],
          },
        });
        if (!order) {
          console.log(nro);
          await this.INTERNO_NAO_USAR_NO_CONTROLLER_interationAcumularPontos(
            interaction as CreateInteractionAcumularZeusSchema,
            item['created_by'],
          );
        } else {
          console.log('Order ja existe' + nro);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
