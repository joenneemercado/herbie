import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateSourceDto {}

export class FindSourceDto {
  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O status_id deve ser um número' })
  @ApiProperty({
    description: 'status_id',
    example: 10,
  })
  status_id?: number;

  @IsOptional() // O campo cursor é opcional
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'O ID deve ser um número' })
  @ApiProperty({
    description: 'id do source',
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
