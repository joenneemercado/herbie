import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCampaingDto {
  @IsOptional()
  @IsString({ message: 'O id deve ser uma string' })
  @ApiProperty()
  id?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O idAudience deve ser um número' })
  @ApiProperty()
  idAudience?: number[];

  @IsOptional()
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  name?: string;

  @IsOptional()
  @IsString({ message: 'O name do cliente' })
  @ApiProperty()
  message?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O typeMessage deve ser um número' })
  @ApiProperty()
  typeMessage?: number;

  @IsOptional()
  @IsString({ message: 'O sendingBy deve ser um UUID válido' })
  @ApiProperty()
  sendingBy?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O statusId deve ser um número' })
  @ApiProperty()
  statusId?: number;

  @IsOptional()
  @IsString({ message: 'O statusId deve ser um UUID válido' })
  @ApiProperty()
  createdAt?: Date;

  @IsOptional()
  @IsString({ message: 'O statusId deve ser um UUID válido' })
  @ApiProperty()
  updatedAt?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'O createdBy deve ser um número' })
  @ApiProperty()
  createdBy?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O updatedBy deve ser um número' })
  @ApiProperty()
  updatedBy?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O priority deve ser um número' })
  @ApiProperty()
  priority?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O channelId deve ser um número' })
  @ApiProperty()
  channelId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O tags deve ser um número' })
  @ApiProperty()
  tags?: number[];

  @IsOptional()
  @IsString({ message: 'O dateStart deve ser uma string' })
  @ApiProperty()
  dateStart?: string;

  @IsOptional()
  @IsString({ message: 'O dateEnd deve ser uma string' })
  @ApiProperty()
  dateEnd?: string;

  @IsOptional()
  @IsString({ message: 'O jsonMeta deve ser uma string' })
  @ApiProperty()
  jsonMeta?: string;

  @IsOptional()
  @IsString({ message: 'O subject deve ser uma string' })
  @ApiProperty()
  subject?: string;

  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional()
  @IsString({ message: 'O customer_unified_id deve ser uma string' })
  @ApiProperty({
    description: 'ID do cliente unificado',
    example: '123',
  })
  customer_unified_id?: string;

  @IsOptional() // O campo cursor é opcional
  @IsString({ message: 'O cursor deve ser uma string' })
  @IsString({ message: 'O cursor deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Cursor para paginação', example: '123' })
  cursor?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @IsString({ message: 'O limit deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;
}

export class CampaingContactDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional()
  @IsString({ message: 'O customer_unified_id deve ser uma string' })
  @ApiProperty({
    description: 'ID do cliente unificado',
    example: '123',
  })
  customer_unified_id?: string;

  @IsOptional() // O campo cursor é opcional
  @IsString({ message: 'O cursor deve ser uma string' })
  @IsString({ message: 'O cursor deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Cursor para paginação', example: '123' })
  cursor?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @IsString({ message: 'O limit deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;
}
