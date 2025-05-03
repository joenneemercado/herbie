import { PartialType } from '@nestjs/mapped-types';
import { CreateAudienceDto } from './create-audience.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateAudienceDto extends PartialType(CreateAudienceDto) {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O status_id deve ser um número' })
  @ApiProperty({
    description: 'status_id da audiencia',
    example: 2,
  })
  status_id?: number;

  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O ID deve ser um número' })
  @ApiProperty({
    description: 'id da audiencia',
    example: 1,
  })
  id?: number;
}
