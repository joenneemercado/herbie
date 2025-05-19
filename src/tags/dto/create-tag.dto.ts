import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty()
  organization_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdBy: number;
}

export class CreateTagWithAssociationDto {
  @ApiProperty()
  organization_id: string;

  @ApiProperty()
  idCustomer: number;

  @ApiProperty()
  idCampaing: number;

  @ApiProperty()
  createdBy: number;
}

export class CreateContactTagsDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @ApiProperty()
  @IsNumber({}, { message: 'O idTag deve ser um number' })
  idTag: number;

  @ApiProperty()
  @IsNumber({}, { message: 'O customer_unified_id deve ser um number' })
  @ApiProperty({
    description: 'ID do cliente unificado',
    example: 123,
  })
  customer_unified_id?: number;
}
