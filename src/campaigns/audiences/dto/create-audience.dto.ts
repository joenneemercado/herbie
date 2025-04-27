import { ApiProperty } from '@nestjs/swagger';
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
    description: 'Nome do seller',
    example: 'mercantilnovaera',
  })
  sellerName?: string;

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
  @IsString({ message: 'O gender deve ser uma string' })
  @ApiProperty({ description: 'Gênero', example: 'male' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'O marital_status deve ser uma string' })
  @ApiProperty({ description: 'Estado civil', example: 'single' })
  marital_status?: string;
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
