import { Injectable } from '@nestjs/common';
import * as fastcsv from 'fast-csv';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { fixEncodingIssues, getNormalizedValue } from '@src/app.utils';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from '@src/database/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { HttpService } from '@nestjs/axios';
import { OrderVtexHook } from './vtex.dto';
import axios from 'axios';
import { VtexConstantes } from './vtex.constantes';

@Injectable()
export class VtexService {
  private http = new HttpService();
  private retryDelay = 500; // 500ms

  constructor(
    private prisma: PrismaService,
    @InjectQueue('vtex-queue') private vtexQueue: Queue,
  ) {}

  //Funcoes e tipo para ajudar na normalizacao
  // Mapas de Normalização (adicione mais conforme necessário)
  genderMap = {
    Masculino: 'Male',
    Feminino: 'Female',
    Outro: 'Other',
    // Adicione outras variações que podem vir da VTEX
  };

  maritalStatusMap = {
    'Solteiro(a)': 'single',
    Solteiro: 'single',
    Solteira: 'single',
    'Casado(a)': 'married',
    Casado: 'married',
    Casada: 'married',
    'Divorciado(a)': 'divorced',
    'Viúvo(a)': 'widowed',
    // Adicione outras variações
  };

  // Função para obter valor normalizado ou o original se não mapeado
  getNormalizedValue(value, map) {
    if (value && map[value]) {
      return map[value];
    }
    return value; // Ou null/undefined se preferir não gravar o valor não mapeado
  }

  // Função para converter data string da VTEX para objeto Date
  parseVtexDate(dateString) {
    return dateString ? new Date(dateString) : null;
  }

  extrairSellerRef(nome: string): string {
    const match = nome.match(/loja(\d+)/i);
    return match ? match[1] : nome.toLowerCase();
  }
  async createFromHook(notificacaoMsg: OrderVtexHook) {
    try {
      //Direcionar para Gestor
      console.log(notificacaoMsg);
      const { OrderId } = notificacaoMsg;
      await this.createCustomerInteraction(
        'cm0l1u61r00003b6junq2pmbi',
        OrderId,
      );
    } catch (error) {
      console.log(error);
    }
  }

  /*
  1- Receber os pedidos da vtex OK
  2- Verificar se eu tenho esse usuario Unificado na base
  3- Caso nao tenha, criar um cadastro e determinar que ele pode ser unificado
  4- Criar um evento de compra pra esse cliente
  */

  async getOrderId(organization_id: string, orderId: string): Promise<any> {
    try {
      const orderTratado = orderId.slice(4); // Remove os primeiros 4 caracteres
      // console.log(orderTratado);
      const API_URL = `${VtexConstantes.API_PRINCIPAL_ORDER_URL}${orderTratado}`;
      const API_KEY = VtexConstantes.API_KEY_PRINCIPAL_VTEX;
      const TOKEN = VtexConstantes.TOKEN_PRINCIPAL_VTEX;
      const response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'X-VTEX-API-AppKey': API_KEY,
          'X-VTEX-API-AppToken': TOKEN,
        },
      });

      //get Email Oficial
      const idProfile = response.data.clientProfileData.userProfileId;
      //console.log('idProfile', idProfile);
      try {
        const API_URL_CRM = `${VtexConstantes.GET_EMAIL_CRM}=${idProfile}`;
        //  console.log('API_URL_CRM', API_URL_CRM);
        const vtexResult = await axios.get(API_URL_CRM, {
          headers: {
            'Content-Type': 'application/json',
            'X-VTEX-API-AppKey': API_KEY,
            'X-VTEX-API-AppToken': TOKEN,
          },
        });
        //console.log('vtexResult', vtexResult.data);
        if (vtexResult.status == 200 && vtexResult.data.length > 0) {
          let emailVtex = response.data.clientProfileData.email;
          //  console.log('Email VTEX', emailVtex);
          emailVtex = vtexResult.data[0].email;
          //  console.log('Email depois VTEX', emailVtex);
          response.data.clientProfileData.email = emailVtex;
          //  console.log('fim', emailVtex);
        }
      } catch (error) {
        console.error('Erro ao buscar pedido:', error);
      }
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    }
  }

  async createCustomerInteraction(
    organization_id: string,
    vtexOrderId: string, // Renomeado para clareza
  ): Promise<any> {
    const pedido = await this.getOrderId(organization_id, vtexOrderId);
    // console.log('Pedido VTEX:', pedido);

    if (!pedido || !pedido.orderId) {
      console.warn(
        `Pedido VTEX ${vtexOrderId} não encontrado ou inválido para organização ${organization_id}.`,
      );
      return; // Ou throw new Error dependendo da sua estratégia
    }

    const {
      document,
      phone,
      firstName,
      lastName,
      email,
      documentType,
      gender,
      marital_status,
    } = pedido.clientProfileData;
    const shippingAddressPayload = pedido.shippingData?.address;
    // console.log('pedido', pedido.clientProfileData);

    return this.prisma.$transaction(
      async (tx) => {
        let customerUnifiedId: number | undefined = undefined;
        let customerId: string | undefined = undefined; // customer.public_id
        let internalCustomerId: number | undefined = undefined; // customer.id (PK)

        // 1. VERIFICAR/CRIAR CLIENTE
        const verifyCustomerUnified = await tx.customerUnified.findFirst({
          where: {
            organization_id,
            cpf: documentType === 'cpf' ? document : undefined, // Só busca por CPF se for CPF
            // Adicionar busca por CNPJ se documentType for 'cnpj'
          },
        });

        if (verifyCustomerUnified) {
          customerUnifiedId = verifyCustomerUnified.id;
        } else {
          const verifyCustomer = await tx.customer.findFirst({
            where: {
              organization_id,
              cpf: documentType === 'cpf' ? document : undefined,
              // Adicionar busca por CNPJ se documentType for 'cnpj'
              source_id: VtexConstantes.SOURCE_ID_VTEX, // Garantir que source_id é string se no DB for string
            },
          });

          if (verifyCustomer) {
            customerId = verifyCustomer.public_id;
            internalCustomerId = verifyCustomer.id;
          } else {
            // Criar novo Customer (não unificado)
            const normalizedGender = getNormalizedValue(gender, this.genderMap);
            const normalizedMaritalStatus = getNormalizedValue(
              marital_status,
              this.maritalStatusMap,
            );
            const newCustomerData = {
              organization_id,
              cpf: documentType === 'cpf' ? document : undefined,
              cnpj: documentType === 'cnpj' ? document : undefined, // Adicionar CNPJ
              phone,
              firstname: firstName,
              lastname: lastName,
              email,
              gender: normalizedGender ?? null,
              marital_status: normalizedMaritalStatus ?? null,

              source_id: VtexConstantes.SOURCE_ID_VTEX,
              created_by: VtexConstantes.SISTEM_USER,
              // public_id é gerado automaticamente
            };

            const createdCustomer = await tx.customer.create({
              data: newCustomerData,
            });
            customerId = createdCustomer.public_id;
            internalCustomerId = createdCustomer.id;

            // Criar endereço para o novo Customer
            if (shippingAddressPayload) {
              await tx.address.create({
                data: {
                  organization_id,
                  customer_id: createdCustomer.public_id, // Link com o public_id do customer
                  address_ref: shippingAddressPayload.addressId, // ID do endereço da VTEX
                  postal_code: shippingAddressPayload.postalCode,
                  number: shippingAddressPayload.number,
                  city: shippingAddressPayload.city,
                  neighborhood: shippingAddressPayload.neighborhood,
                  state: shippingAddressPayload.state,
                  street: shippingAddressPayload.street,
                  complement: shippingAddressPayload.complement,
                  country: shippingAddressPayload.country,
                  address_type: shippingAddressPayload.addressType,
                },
              });
            }
          }
        }

        //Precisa localizar o SELLER para colocar no interaction tb

        if (!pedido.sellers || pedido.sellers.length === 0) {
          throw new Error(
            `Pedido VTEX ${pedido.orderId} não contém informações do vendedor.`,
          );
        }
        const sellerRef = this.extrairSellerRef(pedido.sellers[0].name);
        //console.log('SellerRef:', sellerRef);

        // Supondo que você tem um Seller no seu DB e ele tem um campo `vtex_seller_id`
        const sellerFromDb = await tx.seller.findFirst({
          where: {
            seller_ref: sellerRef, // Ou busque pelo nome, se for mais confiável/único
            organization_id: organization_id,
          },
        });

        if (!sellerFromDb) {
          throw new Error(
            `Vendedor '${pedido.sellers[0].name}' (VTEX ID: ${pedido.sellers[0].id}) não encontrado no sistema para a organização ${organization_id}. Cadastre o vendedor primeiro.`,
          );
        }
        const internalSellerId = sellerFromDb.id;

        // 2. VERIFICAR/CRIAR INTERAÇÃO
        const interactionWhere: Prisma.InteractionWhereInput = {
          organization_id,
          event_id: VtexConstantes.EVENT_ID_COMPRA,
          type: VtexConstantes.EVENT_TYPE_COMPRA,
          source_id: VtexConstantes.SOURCE_ID_VTEX,
          created_by: VtexConstantes.SISTEM_USER, // Assumindo que é um usuário do sistema
          status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
          details: { path: ['orderId'], equals: pedido.orderId },
          seller_id: internalSellerId,
        };

        if (customerUnifiedId) {
          interactionWhere.customer_unified_id = customerUnifiedId;
        } else if (internalCustomerId) {
          // Usar o PK da tabela Customer para o relacionamento
          interactionWhere.customer_id = internalCustomerId; // Assumindo que você tem uma FK para o ID numérico
          // Se 'customer_id' na Interaction for o public_id, use `customerId`
        } else {
          throw new Error(
            'ID de cliente (unificado ou não) não definido para a interação.',
          );
        }

        const findInteracao = await tx.interaction.findFirst({
          where: interactionWhere,
        });

        if (findInteracao) {
          console.warn(
            `Interação de compra para o pedido ${pedido.orderId} já existe.`,
          );
          // Decida se quer retornar a interação existente ou lançar erro.
          // Se lançar erro aqui, a transação será revertida.
          // return findInteracao; // ou throw new Error('Interação de compra já existe');
          // Por ora, vamos permitir que continue para criar o pedido se não existir,
          // mas idealmente, se a interação já existe, o pedido também deveria.
        } else {
          const interactionData: Prisma.InteractionCreateInput = {
            organization: {
              connect: {
                public_id: organization_id,
              },
            },
            details: pedido as any, // O Prisma espera JsonValue, então pode ser necessário um cast
            total: pedido.value,
            created_at: this.parseVtexDate(pedido.creationDate) || new Date(),
            updated_at: new Date(),
            event: {
              connect: {
                id: VtexConstantes.EVENT_ID_COMPRA,
              },
            },
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            Source: {
              connect: {
                id: VtexConstantes.SOURCE_ID_VTEX,
              },
            },
            created_by: VtexConstantes.SISTEM_USER,
            Status: {
              connect: {
                id: VtexConstantes.STATUS_ID_CONCLUIDO,
              },
            },
          };
          if (customerUnifiedId) {
            interactionData.CustomerUnified = {
              connect: { id: customerUnifiedId },
            };
          } else if (internalCustomerId) {
            // Usar o PK da tabela Customer para o relacionamento
            interactionData.Customer = { connect: { id: internalCustomerId } }; // Assumindo FK para o ID numérico
            // Se for public_id: interactionData.customer_id = customerId
          }
          await tx.interaction.create({ data: interactionData });
        }

        // 3. VERIFICAR/CRIAR ORDER E ORDER_ITEMS
        const orderDB = await tx.order.findFirst({
          where: {
            order_ref: pedido.orderId,
            organization_id,
          },
        });

        if (orderDB) {
          console.log(
            `Pedido ${pedido.orderId} já existe no banco de dados com ID: ${orderDB.id}.`,
          );
          return {
            interaction: findInteracao,
            order: orderDB,
            message:
              'Interação e Pedido já existentes ou interação criada e pedido existente.',
          };
        }

        // Mapeamento dos totais
        const totalsMap = (pedido.totals || []).reduce(
          (acc: any, total: any) => {
            acc[total.id] = total.value;
            return acc;
          },
          {},
        );

        // O valor total PAGO pelo cliente
        const grandTotal =
          pedido.paymentData?.transactions?.[0]?.payments?.[0]?.value ||
          pedido.value;

        let absoluteDiscount = totalsMap.Discounts || 0;
        if (totalsMap.Change && totalsMap.Change < 0) {
          absoluteDiscount += Math.abs(totalsMap.Change);
        }

        // TODO: Obter o internalSellerId a partir do pedido.sellers[0].id
        // Exemplo: const vtexSellerId = pedido.sellers?.[0]?.id;
        //          const seller = await tx.seller.findUnique({ where: { vtex_id: vtexSellerId, organization_id } });
        //          if (!seller) throw new Error(`Vendedor VTEX com ID ${vtexSellerId} não encontrado no sistema para org ${organization_id}`);
        //          const internalSellerId = seller.id;

        if (!pedido.sellers || pedido.sellers.length === 0) {
          throw new Error(
            `Pedido VTEX ${pedido.orderId} não contém informações do vendedor.`,
          );
        }
        // const sellerRef = this.extrairSellerRef(pedido.sellers[0].name);

        // // Supondo que você tem um Seller no seu DB e ele tem um campo `vtex_seller_id`
        // const sellerFromDb = await tx.seller.findFirst({
        //   // ou findUnique se vtex_seller_id for unique
        //   where: {
        //     // vtex_id: pedido.sellers[0].id, // ID do seller da VTEX
        //     seller_ref: sellerRef, // Ou busque pelo nome, se for mais confiável/único
        //     organization_id: organization_id,
        //   },
        // });

        // if (!sellerFromDb) {
        //   throw new Error(
        //     `Vendedor '${pedido.sellers[0].name}' (VTEX ID: ${pedido.sellers[0].id}) não encontrado no sistema para a organização ${organization_id}. Cadastre o vendedor primeiro.`,
        //   );
        // }
        // const internalSellerId = sellerFromDb.id;

        const orderData: Prisma.OrderCreateInput = {
          order_ref: pedido.orderId,
          order_date: this.parseVtexDate(pedido.creationDate) || new Date(),
          total: grandTotal,
          subtotal: totalsMap.Items || 0,
          shipping_total: totalsMap.Shipping || 0,
          absolute_discount_total: absoluteDiscount,
          // coupon_code: pedido.marketingData?.coupon, // Verificar estrutura
          user: { connect: { id: VtexConstantes.SISTEM_USER } }, // Conectar ao usuário do sistema
          seller: { connect: { id: internalSellerId } }, // Conectar ao vendedor interno
          organization: { connect: { public_id: organization_id } },
          total_items: pedido.items.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ),
        };

        if (customerUnifiedId) {
          orderData.CustomerUnified = { connect: { id: customerUnifiedId } };
        } else if (customerId) {
          // Se Order.customer_id é a FK para Customer.public_id
          orderData.Customer = { connect: { public_id: customerId } };
        }
        // Se Order.customer_id é uma FK para Customer.id (PK), você usaria 'internalCustomerId'
        // else if (internalCustomerId) {
        //    orderData.customer_id = internalCustomerId; // Não pode usar connect e atribuição direta ao mesmo tempo para o mesmo campo
        // }

        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = (
          pedido.items || []
        ).map((item: any) => {
          const itemDiscount =
            item.listPrice && item.sellingPrice
              ? (item.listPrice - item.sellingPrice) * item.quantity
              : 0;
          return {
            quantity: item.quantity,
            price: item.sellingPrice || item.price, // sellingPrice é o preço de venda, price é o preço original do item na lista
            discount: itemDiscount > 0 ? itemDiscount : 0,
            total:
              item.priceDefinition?.total ||
              (item.sellingPrice || item.price) * item.quantity,
            ean: item.ean,
            name: item.name,
            sku: item.id, // ou item.refId ou item.sellerSku
            brand: item.additionalInfo?.brandName,
            category:
              item.additionalInfo?.categories
                ?.map((c: any) => c.name)
                .join(' | ') || null,
          };
        });

        const createdOrder = await tx.order.create({
          data: {
            ...orderData,
            order_items: {
              createMany: {
                data: orderItemsData,
              },
            },
          },
          include: {
            order_items: true,
          },
        });

        console.log(
          `Pedido ${createdOrder.order_ref} (ID: ${createdOrder.id}) e seus itens foram cadastrados com sucesso.`,
        );
        return {
          interaction:
            findInteracao ||
            'Nova interação criada (ID não retornado nesta demo)',
          order: createdOrder,
          message: 'Processado com sucesso.',
        };
      },
      {
        maxWait: 10000, // default 2000
        timeout: 20000, // default 5000
      }, // Options para a transação
    );
  }

  async processarInteraction() {
    try {
      const interactions = await this.prisma.interaction.findMany({
        where: {
          source_id: VtexConstantes.SOURCE_ID_VTEX,
        },
      });
      console.log('Tamanho da lista: ', interactions.length);
      for (const interaction of interactions) {
        const order = await this.prisma.order.findFirst({
          where: {
            order_ref: interaction.details['orderId'],
            organization_id: interaction.organization_id,
          },
        });
        if (!order) {
          const nro = `SLR-${interaction.details['orderId']}`;
          console.log(nro);
          await this.createCustomerInteraction(
            interaction.organization_id,
            nro,
          );
        } else {
          console.log('Order ja existe');
        }
      }
    } catch (error) {}
  }

  async addFileToQueue(
    filePath: string,
    fileType: 'csv' | 'xlsx',
    organization_id: string,
    source_id: number,
  ): Promise<void> {
    try {
      //console.log('addFileToQueue');
      //console.log(organization_id);
      await this.vtexQueue.add(
        'import-vtex',
        {
          filePath,
          fileType,
          organization_id,
          source_id,
        },
        {
          attempts: 5,
          delay: 10000,
        },
      );
      //console.log('terminou');
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error.message;
    }
  }

  async importFromCSV(
    filePath: string,
    organization_id: string,
    source_id: number,
  ): Promise<void> {
    const stream = fs.createReadStream(filePath);
    const customers: Customer[] = [];

    const csvStream = fastcsv
      .parse({ headers: true })
      .on('data', (data) => {
        customers.push(this.mapToCustomer(data, organization_id, source_id));
      })
      .on('end', async () => {
        await this.saveCustomers(customers);
      });

    stream.pipe(csvStream);
  }

  async importFromXLSX(
    filePath: string,
    organization_id: string,
    source_id: number,
  ): Promise<any> {
    try {
      console.log('xlsx');
      console.log(source_id);
      let attempts = 5;
      while (!fs.existsSync(filePath) && attempts > 0) {
        console.log(
          `Arquivo não encontrado, tentando novamente em ${this.retryDelay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        attempts--;
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`O arquivo não existe: ${filePath}`);
      }

      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      console.log('dados', jsonData);
      console.log('metodo-vtex');
      //return jsonData;
      // Aplicar a função de correção a todos os campos do objeto
      const cleanedData = jsonData.map((item: any) => {
        return Object.fromEntries(
          Object.entries(item).map(([key, value]) => {
            if (typeof value === 'string' && value.trim().length > 0) {
              return [key, fixEncodingIssues(value)];
            }
            return [key, value];
          }),
        );
      });
      const customers: Customer[] = [];
      for (const data of cleanedData) {
        const item = this.mapToCustomer(data, organization_id, source_id);
        customers.push(item);
      }

      console.log(customers);
      await this.saveCustomers(customers);
    } catch (error) {
      console.error('Erro ao importar o arquivo XLSX:', error);
      throw error;
    }
  }

  private mapToCustomer(
    data: any,
    organization_id: string,
    source_id: number,
  ): Customer {
    const {
      email,
      homePhone,
      firstName,
      lastName,
      document,
      documentType,
      gender,
      birthDate,
      createdIn,
    } = data;

    if (!firstName) {
      return null;
    }
    console.log(data);
    console.log({
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: homePhone ? String(homePhone) : undefined,
      cpf: documentType === 'cpf' ? String(document) : undefined,
      cnpj: documentType === 'cnpj' ? String(document) : undefined,
      company_name: data.company_name,
      trading_name: data.trading_name,
      date_birth: birthDate ? new Date(birthDate) : null,
      gender: gender,
      marital_status: undefined,
      has_child: data.has_child ? Number(data.has_child) : null,
      organization_id: String(organization_id),
      created_at: new Date(createdIn),
      created_by: 1, // Exemplo de valor padrão
      updated_by: 1, // Exemplo de valor padrão
      last_updated_system: 'import',
      source_id: source_id ? Number(source_id) : null,
    });

    if (firstName.length > 3) {
      return {
        firstname: String(firstName),
        lastname: lastName ? String(lastName) : undefined,
        email: email,
        phone: homePhone ? String(homePhone) : undefined,
        cpf: documentType === 'cpf' ? String(document) : undefined,
        cnpj: documentType === 'cnpj' ? String(document) : undefined,
        company_name: data.company_name,
        trading_name: data.trading_name,
        date_birth: birthDate ? new Date(birthDate) : null,
        gender: gender,
        marital_status: undefined,
        has_child: data.has_child ? Number(data.has_child) : null,
        organization_id: String(organization_id),
        created_at: new Date(createdIn),
        created_by: 1, // Exemplo de valor padrão
        updated_by: 1, // Exemplo de valor padrão
        last_updated_system: 'import',
        source_id: source_id ? Number(source_id) : null,
      } as Customer;
    } else {
      return null;
    }
  }

  private async saveCustomers(customers: Customer[]): Promise<any> {
    const uniqueCustomers: { [key: string]: Customer } = {};
    const issues: any[] = [];

    for (const customer of customers) {
      if (!customer) continue;

      // Normalize null values
      customer.cnpj = customer.cnpj === 'undefined' ? null : customer.cnpj;
      customer.cpf = customer.cpf === 'undefined' ? null : customer.cpf;

      // Generate a unique key based on the fields that should be unique
      const uniqueKey = `${customer.cpf || ''}-${customer.email || ''}-${customer.phone || ''}`;

      // Check if the customer already exists in the unique list
      if (uniqueCustomers[uniqueKey]) {
        issues.push({
          cpf: customer.cpf,
          email: customer.email,
          phone: customer.phone,
          firstname: customer.firstname,
          lastname: customer.lastname,
          issue_description: 'Duplicated entry in the input list',
        });
      } else {
        // Ensure the customer is valid before adding
        if (customer.firstname.trim().length > 3) {
          uniqueCustomers[uniqueKey] = customer;
        } else {
          issues.push({
            cpf: customer.cpf,
            email: customer.email,
            phone: customer.phone,
            firstname: customer.firstname,
            lastname: customer.lastname,
            source_id: customer.source_id,
            issue_description: 'First name is too short',
          });
        }
      }
    }

    const itemsSave = Object.values(uniqueCustomers);

    if (itemsSave.length > 0) {
      try {
        const customersSave = await this.prisma.customer.createManyAndReturn({
          select: {
            public_id: true,
            created_at: true,
            organization_id: true,
            source_id: true,
          },
          data: itemsSave,
          skipDuplicates: true, // Skip duplicates at the database level
        });
        //Criar a interations
        const interactions = [];
        for (const idCustomer of customersSave) {
          interactions.push({
            created_at: new Date(idCustomer.created_at),
            customer_id: idCustomer.public_id,
            event_id: 1, //todo: colocar em uma variavel
            organization_id: idCustomer.organization_id,
            source_id: idCustomer.source_id,
          });
        }
        if (interactions.length > 0) {
          console.log('existe interacoes');
          await this.prisma.interaction.createMany({
            data: interactions,
            skipDuplicates: true,
          });
        }
      } catch (error) {
        console.error('Error saving customers:', error);
        issues.push({
          issue_description: 'Error saving customers to database',
        });
      }
    }

    // Save issues to the temporary table
    if (issues.length > 0) {
      try {
        await this.prisma.tempCustomerIssues.createMany({
          data: issues,
        });
      } catch (error) {
        console.error(
          'Error saving issues to TempCustomerIssues table:',
          error,
        );
      }
    }

    return {
      savedCustomers: itemsSave,
      issues: issues.length > 0 ? issues : null,
    };
  }

  // async processingOrderOld(organization_id: string) {
  //   console.log('Iniciando processamento do pedido', organization_id);
  //   const API_URL = `${VtexConstantes.API_PRINCIPAL_ORDER_URL}`;
  //   const API_KEY = VtexConstantes.API_KEY_PRINCIPAL_VTEX;
  //   const TOKEN = VtexConstantes.TOKEN_PRINCIPAL_VTEX;
  //   const response = await axios.get(API_URL, {
  //     params: {
  //       f_status: 'invoiced',
  //       orderBy: 'creationDate,asc',
  //       page: 1,
  //       per_page: 1,
  //     },
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-VTEX-API-AppKey': API_KEY,
  //       'X-VTEX-API-AppToken': TOKEN,
  //     },
  //   });
  //   //console.log('response', response.data);
  //   for (const order of response.data.list) {
  //     const vtexOrderId = `SLR-1336260576428-01`;
  //     const vtexOrderId = `SLR-${order.orderId}`;
  //     const processOrder = await this.createCustomerInteraction(
  //       organization_id,
  //       vtexOrderId,
  //     );
  //     console.log('processOrder', processOrder);
  //   }
  // }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async processingOrderOld(organization_id: string) {
    const API_URL = VtexConstantes.API_PRINCIPAL_ORDER_URL;
    const API_KEY = VtexConstantes.API_KEY_PRINCIPAL_VTEX;
    const TOKEN = VtexConstantes.TOKEN_PRINCIPAL_VTEX;

    const PER_PAGE = 100;
    let totalPedidosProcessados = 0;

    const endDate = new Date();
    const startDate = new Date('2023-08-31T00:00:00');

    console.log(
      `Iniciando busca de pedidos de ${startDate.toLocaleDateString()} até ${endDate.toLocaleDateString()}`,
    );

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Pega os componentes da data (ano, mês, dia)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
      const day = String(d.getDate()).padStart(2, '0');

      // Cria strings que representam o início e o fim do dia NO SEU FUSO HORÁRIO (UTC-4)
      const dayStartLocalISO = `${year}-${month}-${day}T00:00:00.000-04:00`;
      const dayEndLocalISO = `${year}-${month}-${day}T23:59:59.999-04:00`;

      // Converte essas datas para o formato UTC que a API da VTEX espera
      // O .toISOString() faz a conversão de -04:00 para Z (UTC) automaticamente
      const dayStartUTC = new Date(dayStartLocalISO).toISOString();
      const dayEndUTC = new Date(dayEndLocalISO).toISOString();

      const creationDateFilter = `creationDate:[${dayStartUTC} TO ${dayEndUTC}]`;

      console.log(
        `--- Buscando pedidos para o dia: ${day}/${month}/${year} (Fuso Local) ---`,
      );

      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          // ... o resto do seu código continua igual ...
          console.log(
            `Buscando página ${currentPage} para o dia ${day}/${month}/${year}...`,
          );

          const response = await axios.get(API_URL, {
            timeout: 30000,
            params: {
              f_creationDate: creationDateFilter,
              f_status: 'invoiced',
              orderBy: 'creationDate,asc',
              page: currentPage,
              per_page: PER_PAGE,
            },
            headers: {
              'Content-Type': 'application/json',
              'X-VTEX-API-AppKey': API_KEY,
              'X-VTEX-API-AppToken': TOKEN,
            },
          });

          // ... o resto do seu código continua igual ...
          const { list, paging } = response.data;

          if (list && list.length > 0) {
            console.log(
              `Encontrados ${list.length} pedidos na página ${currentPage}.`,
            );
            for (const order of list) {
              try {
                const vtexOrderId = `SLR-${order.orderId}`;
                await this.createCustomerInteraction(
                  organization_id,
                  vtexOrderId,
                );
                totalPedidosProcessados++;
                console.log(
                  `[${totalPedidosProcessados}] Pedido ${order.orderId} processado.`,
                );
              } catch (orderError) {
                console.error(
                  `ERRO ao processar o pedido ${order.orderId}:`,
                  orderError.message,
                );
              }
            }
          }

          if (
            currentPage >= paging.pages ||
            paging.pages === 0 ||
            list.length === 0
          ) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
        } catch (pageError) {
          console.error(
            `ERRO FATAL ao buscar a página ${currentPage} para o dia ${day}/${month}/${year}.`,
            pageError.message,
          );
          hasMorePages = false;
        }
      }
    }

    console.log(
      `--- PROCESSO CONCLUÍDO. Total de pedidos processados: ${totalPedidosProcessados} ---`,
    );
  }
}
