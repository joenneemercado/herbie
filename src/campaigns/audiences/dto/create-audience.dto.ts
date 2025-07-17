import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateAudienceDto {
  @IsOptional()
  @IsNumber({}, { message: 'O id deve ser um número' })
  @ApiProperty({
    description: 'Identificação única da audiência',
    example: 123456,
  })
  id?: number;

  @IsString({ message: 'O audiencia deve ser uma string' })
  @ApiProperty({ description: 'Nome da audiência', example: 'Nova audiência' })
  name: string;

  @IsOptional()
  @IsString({ message: 'O audiencia deve ser uma string' })
  @ApiProperty({
    description: 'Nome do seller_ref',
    example: 'mercantilnovaera',
  })
  seller_ref?: string;

  @IsOptional()
  @IsString({ message: 'Nome do store_chain' })
  @ApiProperty({
    description: 'Nome do store_chain',
    example: 'nova era',
  })
  store_chain?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O statusId deve ser um número' })
  @ApiProperty({ description: 'ID do status', example: 1 })
  statusId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O createdBy deve ser um número' })
  @ApiProperty({ description: 'Usuário que criou a audiência', example: 101 })
  createdBy?: number;

  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsOptional()
  @IsArray({ message: 'O date_birth_start deve ser um array de strings' })
  @ApiProperty({
    description: 'Datas de nascimento início',
    type: [String],
    example: ['1990-01-01'],
  })
  date_birth_start?: string[];

  @IsOptional()
  @IsArray({ message: 'O date_birth_end deve ser um array de strings' })
  @ApiProperty({
    description: 'Datas de nascimento fim',
    type: [String],
    example: ['2000-12-31'],
  })
  date_birth_end?: string[];

  @IsOptional()
  @IsArray({ message: 'O date_birth_start deve ser um array de strings' })
  @ApiProperty({
    description: 'Datas de nascimento início',
    type: [String],
    example: ['1990-01-01'],
  })
  date_order_start?: string[];

  @IsOptional()
  @IsArray({ message: 'O date_birth_end deve ser um array de strings' })
  @ApiProperty({
    description: 'Datas de nascimento fim',
    type: [String],
    example: ['2000-12-31'],
  })
  date_order_end?: string[];

  @IsOptional()
  @IsString({ message: 'O gender deve ser uma string' })
  @ApiProperty({ description: 'Gênero', example: 'male' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'O marital_status deve ser uma string' })
  @ApiProperty({ description: 'Estado civil', example: 'single' })
  marital_status?: string;
}

export class CreateAudienceCustomerUnifiedDto {
  @IsString({ message: 'O audiencia deve ser uma string' })
  @ApiProperty({ description: 'Nome da audiência', example: 'Nova audiência' })
  name: string;

  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsArray()
  @ApiProperty({ description: 'ID do customer unified', example: [1] })
  id_customer_unified: number[];
}

export class FindSegmentAudienceDto {
  @IsOptional()
  @IsString({ message: 'O nome da audiencia deve ser um string' })
  @ApiProperty({ description: 'Nome da audiência', example: 'Nova audiência' })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'Valor total minimo de compras deve ser um número' })
  @ApiProperty({ description: 'total', example: 1 })
  total_start?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'Valor total maximo de compras deve ser um número' })
  @ApiProperty({ description: 'total', example: 1000 })
  total_end?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O createdBy deve ser um número' })
  @ApiProperty({ description: 'Usuário que criou a audiência', example: 101 })
  createdBy?: number;

  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsOptional()
  @IsArray({ message: 'O date_birth_start deve ser um array de strings' })
  @IsArray()
  @IsString({ each: true, message: 'Cada source_id deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        return [String(value)];
      }
    }
    return Array.isArray(value) ? value.map(String) : [String(value)];
  })
  @ApiProperty({ type: [String] })
  date_birth_start?: string[];

  @IsOptional()
  @IsArray({ message: 'O date_birth_end deve ser um array de strings' })
  @IsArray()
  @IsString({ each: true, message: 'Cada source_id deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        return [String(value)];
      }
    }
    return Array.isArray(value) ? value.map(String) : [String(value)];
  })
  @ApiProperty({ type: [String] })
  date_birth_end?: string[];

  @IsOptional()
  @ApiProperty({
    description: 'Data de início do pedido', // Descrição corrigida
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  date_order_start?: string; // Alterar tipo para string

  @IsOptional()
  @ApiProperty({
    description: 'Data de término do pedido', // Descrição corrigida
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  date_order_end?: string; // Alterar tipo para string

  @IsOptional()
  @ApiProperty({
    description: 'Ticket Médio Start', // Descrição corrigida
    example: '100',
    required: false,
  })
  ticket_order_start?: string; // Alterar tipo para string

  @IsOptional()
  @ApiProperty({
    description: 'Ticket Médio End', // Descrição corrigida
    example: '1000',
    required: false,
  })
  ticket_order_end?: string; // Alterar tipo para string

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O dia de nascimento deve ser um número' })
  @ApiProperty({ description: 'Dia de nascimento', example: 15 })
  birth_day?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O mês de nascimento deve ser um número' })
  @ApiProperty({ description: 'Mês de nascimento', example: 6 })
  birth_month?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O ano de nascimento deve ser um número' })
  @ApiProperty({ description: 'Ano de nascimento', example: 1990 })
  birth_year?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada refId deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  gender?: string[];

  @ApiPropertyOptional({
    description: 'Codigo de referencia da loja',
    example: '1',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada seller_ref deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  seller_ref?: string[];

  @ApiPropertyOptional({
    description: 'id do seller preferencial',
    example: 'Nova era, Patio gourmet',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
    message: 'Id da loja preferencial deve ser uma string',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  seller_preference_id?: string[];

  @ApiPropertyOptional({
    description: 'Nome do rfm que deseja filtrar',
    example: 'Frequente',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
    message: 'Nome do rfm que deseja filtrar deve ser uma string',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  rfm_name?: string[];

  @ApiPropertyOptional({
    description: 'id grupo de lojas',
    example: 'Nova era, Patio gourmet',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada store_chain_id deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  store_chain_id?: string[];

  // @IsOptional()
  // @IsString({ message: 'O marital_status deve ser uma string' })
  // @ApiProperty({ description: 'Estado civil', example: 'single' })
  // marital_status?: string;

  @ApiPropertyOptional({
    description: 'estado civil',
    example: 'solteiro',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada marital_status deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  marital_status?: string[];

  @ApiPropertyOptional({
    description: 'id da tag',
    example: '1',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada refId deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        // Tenta tratar caso seja string do tipo '[female,male]'
        const fallbackParsed = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim());
        return fallbackParsed;
      }
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => {
        if (typeof v === 'string' && /^\[.*\]$/.test(v)) {
          return v
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((s) => s.trim());
        }
        return v;
      });
    }

    return [String(value)];
  })
  @ApiProperty({ type: [String] })
  tag_id?: string[];

  @ApiPropertyOptional({
    description: 'id do source_id',
    example: '1',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada source_id deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        return [String(value)];
      }
    }
    return Array.isArray(value) ? value.map(String) : [String(value)];
  })
  @ApiProperty({ type: [String] })
  source_id?: string[];

  @ApiPropertyOptional({
    description: 'id do event_id',
    example: '1',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada event_id deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        return [String(value)];
      }
    }
    return Array.isArray(value) ? value.map(String) : [String(value)];
  })
  @ApiProperty({ type: [String] })
  event_id?: string[];

  // @IsOptional() // O campo cursor é opcional
  // @IsString({ message: 'O refId deve ser uma string' })
  // @ApiProperty({ description: 'refId para paginação', example: '123' })
  // refId?: string;

  @ApiPropertyOptional({
    description: 'Codigo de referencia dos produtos',
    example: '1',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada refId deve ser uma string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
      } catch {
        return [String(value)];
      }
    }
    return Array.isArray(value) ? value.map(String) : [String(value)];
  })
  @ApiProperty({ type: [String] })
  refId?: string[];

  @IsOptional() // O campo cursor é opcional
  @IsString({ message: 'O page deve ser uma string' })
  @ApiProperty({ description: 'page para paginação', example: '123' })
  page?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;
}

export class CreateAudienceInteractionDto {
  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsOptional()
  @IsString({ message: 'O dateBegin deve ser uma string' })
  @ApiProperty({
    description: 'Data de início',
    example: '2024-01-01T00:00:00.000Z',
  })
  dateBegin?: string;

  @IsOptional()
  @IsString({ message: 'O dateEnd deve ser uma string' })
  @ApiProperty({
    description: 'Data de término',
    example: '2024-12-31T23:59:59.999Z',
  })
  dateEnd?: string;

  @IsOptional()
  @IsString({ message: 'O ean deve ser uma string' })
  @ApiProperty({
    description: 'Código EAN do produto',
    example: '7891234567890',
  })
  ean?: string;

  @IsOptional()
  @IsString({ message: 'O refId deve ser uma string' })
  @ApiProperty({ description: 'Referência do pedido', example: 'REF123456' })
  refId?: string;

  @IsOptional()
  @IsString({ message: 'O status_order deve ser uma string' })
  @ApiProperty({ description: 'Status do pedido', example: 'delivered' })
  status_order?: string;
}

export class FindAudienceContactDto {
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O ID deve ser um número' })
  @ApiProperty({ description: 'id', example: 1 })
  @ApiProperty({
    description: 'Identificação única da audiência',
    example: 1,
  })
  id?: number;

  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsOptional() // O campo limit é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O page deve ser um número' })
  @ApiProperty({ description: 'page', example: 1 })
  @ApiProperty({
    description: 'page para paginação',
    example: 1,
  })
  page?: number;

  @IsOptional() // O campo limit é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O limit deve ser um número' })
  @ApiProperty({ description: 'limit', example: 1 })
  @ApiProperty({
    description: 'limit para paginação',
    example: 1,
  })
  limit?: number;
}

export class FindAudienceStatusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O ID deve ser um número' })
  @ApiProperty({
    description: 'id do channel',
    example: 1,
  })
  id?: number;

  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O page deve ser um número' })
  @ApiProperty({ description: 'page', example: 1 })
  @ApiProperty({
    description: 'page',
    example: 1,
  })
  page?: number;

  @IsOptional() // O campo limit é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O limit deve ser um número' })
  @ApiProperty({ description: 'limit', example: 10 })
  @ApiProperty({
    description: 'limit',
    example: 10,
  })
  limit?: number;
}

export class UploadCSVDto {
  @IsString({ message: 'O organization_id deve ser uma string' })
  @ApiProperty({ description: 'ID da organização', example: 'org-abc123' })
  organization_id: string;

  @IsString({ message: 'O audiencia deve ser uma string' })
  @ApiProperty({ description: 'Nome da audiência', example: 'Nova audiência' })
  audienceName: string;
}
