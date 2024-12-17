import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { PrismaService } from '@src/database/prisma.service';
import { Queue } from 'bull';
import * as fastcsv from 'fast-csv';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { fixEncodingIssues, splitName } from '@src/app.utils';
import { addDays, format } from 'date-fns';

@Injectable()
export class OpahService {
  private retryDelay = 500; // 500ms
  constructor(
    private prisma: PrismaService,
    @InjectQueue('opah-queue') private opahQueue: Queue,
  ) {}
  //constructor(@InjectQueue('import-queue') private importQueue: Queue) {}

  async addFileToQueue(
    filePath: string,
    fileType: 'csv' | 'xlsx',
    organization_id: string,
    source_id: number,
  ): Promise<void> {
    try {
      //console.log('addFileToQueue');
      //console.log(organization_id);
      await this.opahQueue.add(
        'import',
        {
          filePath,
          fileType,
          organization_id,
          source_id,
        },
        {
          attempts: 5,
          delay: 50000,
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
  ): Promise<void> {
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
      console.log(jsonData);
      console.log('metodo');
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
    const { firstname, lastname } = splitName(data.cliente);

    const serialDate = data.dataAprovacao;

    // A data base do Excel (01/01/1900)
    const excelBaseDate = new Date(1899, 11, 30); // 30 de dezembro de 1899
    // Usando date-fns para adicionar os dias serializados à data base
    const dataConvertida = addDays(excelBaseDate, serialDate);
    // Formatando a data no formato desejado (yyyy-MM-dd)
    const dataFormatada = format(dataConvertida, 'yyyy-MM-dd HH:mm:ss.SSS');

    // Fazendo a conversão para o objeto Date
    // const dataConvertida = parse(
    //   data.dataAprovacao,
    //   formatoEntrada,
    //   new Date(),
    // );

    // Definindo o formato de saída desejado: yyyy-MM-dd HH:mm:ss.SSS
    //const formatoSaida = 'yyyy-MM-dd HH:mm:ss.SSS';

    // Formatando a data no formato desejado
    //const dataFormatada = format(dataConvertida, formatoSaida);
    if (firstname.trim().length > 2) {
      return {
        firstname: firstname,
        lastname: lastname,
        email: data.email,
        phone: data.phone ? String(data.phone) : undefined,
        cpf: data.cpf ? String(data.cpf) : undefined,
        cnpj: data.cnpj ? String(data.cnpj) : undefined,
        company_name: data.company_name,
        trading_name: data.trading_name,
        date_birth: data.date_birth ? new Date(data.date_birth) : null,
        gender: data.gender,
        marital_status: data.marital_status,
        has_child: data.has_child ? Number(data.has_child) : null,
        organization_id: String(organization_id),
        created_at: new Date(dataFormatada),
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
            source_id: customer.source_id,
            firstname: customer.firstname,
            lastname: customer.lastname,
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
            event_id: 2, //todo: colocar em uma variavel
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
