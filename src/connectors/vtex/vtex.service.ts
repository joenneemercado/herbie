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

@Injectable()
export class VtexService {
  private http = new HttpService();
  private retryDelay = 500; // 500ms

  constructor(
    private prisma: PrismaService,
    @InjectQueue('vtex-queue') private vtexQueue: Queue,
  ) {}

  async createFromHook(notificacaoMsg: OrderVtexHook) {
    //Direcionar para Gestor
    console.log(notificacaoMsg);
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
