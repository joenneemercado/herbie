import { ApiProperty } from '@nestjs/swagger';

/*
  id              Int       @id @default(autoincrement())
  public_id       String    @unique @default(cuid())
  nickname        String?
  firstname       String
  lastname        String?
  email           String    @unique
  phone           String?
  cpf             String    @unique
  cnpj            String?
  company_name    String?
  trading_name    String?
  date_birth      DateTime?
  gender          String?
  marital_status  String?
  has_child       Boolean?
  organization_id String
*/

export class CustomerDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  public_id?: string;

  @ApiProperty()
  nickname?: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  cnpj?: string;

  @ApiProperty()
  company_name?: string;

  @ApiProperty()
  trading_name?: string;

  @ApiProperty()
  date_birth?: Date;

  @ApiProperty()
  gender?: string;

  @ApiProperty()
  marital_status?: string;

  @ApiProperty()
  has_child?: boolean;

  // @ApiProperty()
  // organization_id?: string;
}

export class CreateCustomerDto extends CustomerDto {}

export class PaginatedCustomersDto {
  @ApiProperty({
    description: 'List of Customers',
    isArray: true,
    type: [CustomerDto],
    example: {
      id: 1,
      public_id: 'cuid123',
      nickname: 'Johnny',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      cpf: '12345678901',
      cnpj: '12345678901234',
      company_name: 'John Doe Inc.',
      trading_name: 'Doe Trading',
      date_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'single',
      has_child: false,
      organization_id: 'org123',
    },
  })
  data: CustomerDto[];

  @ApiProperty({ description: 'Total number of customers' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}
