import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSellerDto {}

export class FindSellerDto {
  @IsOptional() // O campo cursor é opcional
  @IsString({ message: 'O name deve ser um string' })
  @ApiProperty({
    description: 'nome do seller',
    example: 'Cash Flores',
  })
  name?: string;

  @IsOptional() // O campo cursor é opcional
  @IsString({ message: 'O ref deve ser um string' })
  @ApiProperty({
    description: 'ref do seller',
    example: '10',
  })
  ref?: string;

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
