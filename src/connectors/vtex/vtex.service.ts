import { Injectable } from '@nestjs/common';
import * as fastcsv from 'fast-csv';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { fixEncodingIssues } from '@src/app.utils';
import { Customer } from '@prisma/client';
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
      try {
        const API_URL_CRM = `${VtexConstantes.GET_EMAIL_CRM}=${idProfile}`;
        const vtexResult = await axios.get(API_URL_CRM, {
          headers: {
            'Content-Type': 'application/json',
            'X-VTEX-API-AppKey': API_KEY,
            'X-VTEX-API-AppToken': TOKEN,
          },
        });
        if (vtexResult.status == 200) {
          let emailVtex = response.data.clientProfileData.email;
          emailVtex = vtexResult.data[0].email;
          response.data.clientProfileData.email = emailVtex;
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
    orderId: string,
  ): Promise<any> {
    try {
      //console.log(organization_id, orderId);
      const pedido = await this.getOrderId(organization_id, orderId);
      //console.log('Pedido:', pedido);
      if (!pedido) {
        return;
      }
      //TODO desestruturar o objeto de cliente
      const { document, phone, firstName, lastName, email } =
        pedido.clientProfileData;

      //TODO desestruturar o objeto de endereco
      const {
        addressType,
        postalCode,
        city,
        state,
        country,
        street,
        number,
        neighborhood,
        complement,
        reference,
      } = pedido.shippingData.address;

      //TODO verificar se o cliente e unificado
      const verifyCustomerUnified = await this.prisma.customerUnified.findFirst(
        {
          where: {
            organization_id,
            cpf: document,
          },
        },
      );
      //console.log('existe cliente unificado', verifyCustomerUnified);
      const verifyCustomer = await this.prisma.customer.findFirst({
        where: {
          organization_id,
          cpf: document,
          source_id: VtexConstantes.SOURCE_ID_VTEX,
        },
      });
      //console.log('existe cliente na base ', verifyCustomer);
      if (verifyCustomerUnified) {
        const findInteracao = await this.prisma.interaction.findFirst({
          where: {
            organization_id,
            customer_unified_Id: verifyCustomerUnified.id,
            event_id: VtexConstantes.EVENT_ID_COMPRA,
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            created_by: VtexConstantes.SISTEM_USER,
            status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
            //details:pedido
            details: {
              path: ['orderId'], // Caminho dentro do JSON
              equals: pedido.orderId, // Comparação exata
            },
          },
        });
        //console.log('encontrou interacao', findInteracao);
        if (findInteracao) {
          throw new Error('Interacao de compra já existe');
        }
        await this.prisma.interaction.create({
          data: {
            organization_id,
            customer_unified_Id: verifyCustomerUnified.id,
            details: pedido,
            total: pedido.value,
            event_id: VtexConstantes.EVENT_ID_COMPRA,
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            created_by: VtexConstantes.SISTEM_USER,
            status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
          },
        });
      } else if (!verifyCustomerUnified && verifyCustomer) {
        const findInteracao = await this.prisma.interaction.findFirst({
          where: {
            organization_id,
            customer_unified_Id: verifyCustomer.id,
            event_id: VtexConstantes.EVENT_ID_COMPRA,
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            created_by: VtexConstantes.SISTEM_USER,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
            //details:pedido
            details: {
              path: ['orderId'], // Caminho dentro do JSON
              equals: pedido.orderId, // Comparação exata
            },
          },
        });
        if (findInteracao) {
          throw new Error('Interacao de compra já existe');
        }
        await this.prisma.interaction.create({
          data: {
            organization_id,
            customer_id: verifyCustomer.id,
            details: pedido,
            total: pedido.value,
            event_id: VtexConstantes.EVENT_ID_COMPRA,
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            created_by: VtexConstantes.SISTEM_USER,
            status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
          },
        });
      } else {
        const createCustomer = await this.prisma.customer.create({
          data: {
            organization_id,
            cpf: document,
            phone,
            firstname: firstName,
            lastname: lastName,
            email,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            created_by: VtexConstantes.SISTEM_USER,
            addresses: {
              create: {
                organization_id,
                postal_code: postalCode,
                number,
                city,
                neighborhood,
                state,
                street,
                complement,
                country,
                address_type: addressType,
                address_ref: reference,
              },
            },
          },
        });
        //console.log('criando usuario', createCustomer);
        const creatCustomerUnified = await this.prisma.customerUnified.create({
          data: {
            organization_id,
            cpf: document,
            phone,
            firstname: firstName,
            lastname: lastName,
            email,
            created_by: VtexConstantes.SISTEM_USER,
            status_id: VtexConstantes.CUSTOMER_UNIFIED,
          },
        });

        await this.prisma.customer_CustomerUnified.create({
          data: {
            customer_id: createCustomer.id,
            customer_unified_id: creatCustomerUnified.id,
          },
        });
        await this.prisma.interaction.create({
          data: {
            organization_id,
            customer_unified_Id: creatCustomerUnified.id,
            details: pedido,
            total: pedido.value,
            event_id: VtexConstantes.EVENT_ID_COMPRA,
            type: VtexConstantes.EVENT_TYPE_COMPRA,
            created_by: VtexConstantes.SISTEM_USER,
            source_id: VtexConstantes.SOURCE_ID_VTEX,
            status_id: VtexConstantes.STATUS_ID_CONCLUIDO,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao obter o pedido:', error);
    }
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
}
