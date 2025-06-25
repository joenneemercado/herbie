import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateInvioDto {}

export class FindAllInvioDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsString({ message: 'O ChannelId deve ser String' })
  @ApiProperty()
  channelId: string;

  @IsOptional()
  @IsString({ message: 'O name deve ser uma string' })
  @ApiProperty({
    description: 'Name of template',
    example: 'teemplate name',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'O nameOrderBy deve ser uma string' })
  @ApiProperty({
    description: 'name camp order by',
    example: 'updatedAt',
  })
  nameOrderBy?: string;

  @IsOptional()
  @IsString({ message: 'O orderDirection deve ser uma string' })
  @ApiProperty({
    description: 'order direction',
    example: 'DESCENDING',
  })
  orderDirection?: string;

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
}
