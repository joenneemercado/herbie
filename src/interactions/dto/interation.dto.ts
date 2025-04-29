import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

//todo interacao
export class InterationDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @IsString({ message: 'O limit deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O page deve ser uma string' })
  @IsString({ message: 'O page deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Page de registros por página', example: '1' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'O customer_unified_id deve ser uma string' })
  @ApiProperty({
    description: 'ID do cliente unificado',
    example: '123',
  })
  customer_unified_id?: string;

  @IsOptional()
  @IsString({ message: 'O customer deve ser uma string' })
  @ApiProperty({
    description: 'ID do customer ',
    example: '123',
  })
  customer_id?: string;

  @IsOptional()
  @IsString({ message: 'O orderby deve ser uma string' })
  @ApiProperty({
    description: 'Ordenação dos resultados',
    example: 'desc',
  })
  orderby?: string;
}

//todo interacao de compra
export class InterationCompraDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @IsString({ message: 'O limit deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O page deve ser uma string' })
  @IsString({ message: 'O page deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Page de registros por página', example: '1' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'O sellerName deve ser uma string' })
  @ApiProperty({
    description: 'Nome do seller',
    example: 'mercantilnovaeraloja10',
  })
  sellerName?: string;

  @IsOptional()
  @IsString({ message: 'O dateBegin deve ser uma string' })
  @ApiProperty({
    description: 'Data de início',
    example: '2023-01-01',
  })
  dateBegin?: string;

  @IsOptional()
  @IsString({ message: 'O dateEnd deve ser uma string' })
  @ApiProperty({
    description: 'Data de fim',
    example: '2023-01-01',
  })
  dateEnd?: string;

  @IsOptional()
  @IsString({ message: 'O ean deve ser uma string' })
  @ApiProperty({
    description: 'EAN',
    example: '123',
  })
  ean?: string;

  @IsOptional()
  @IsString({ message: 'O refId deve ser uma string' })
  @ApiProperty({
    description: 'Ref ID',
    example: '123',
  })
  refId?: string;

  @IsOptional()
  @IsString({ message: 'O status_order deve ser uma string' })
  @ApiProperty({
    description: 'Status do pedido',
    example: 'invoiced',
  })
  status_order?: string;
}

//todo interacao teucard
export class InterationTeuCardDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O limit deve ser uma string' })
  @IsString({ message: 'O limit deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Limite de registros por página', example: '10' })
  limit?: string;

  @IsOptional() // O campo limit é opcional
  @IsString({ message: 'O page deve ser uma string' })
  @IsString({ message: 'O page deve ser um número válido' }) // Adicionando a verificação se for número
  @ApiProperty({ description: 'Page de registros por página', example: '1' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'O dateBegin deve ser uma string' })
  @ApiProperty({
    description: 'Data de início',
    example: '2023-01-01',
  })
  dateBegin?: string;

  @IsOptional()
  @IsString({ message: 'O dateEnd deve ser uma string' })
  @ApiProperty({
    description: 'Data de fim',
    example: '2023-01-01',
  })
  dateEnd?: string;
}

export class IntrationCustomerUnifiedDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

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

  @IsOptional()
  @IsString({ message: 'O customer_unified_id deve ser uma string' })
  @ApiProperty({
    description: 'ID do cliente unificado',
    example: '123',
  })
  customer_unified_id?: string;
}
