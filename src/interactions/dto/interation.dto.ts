import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { z } from 'zod';

export const findInteractionSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  sellerName: z.string().optional(),
  dateBegin: z.string().optional(), // Pode validar formato de data se quiser
  dateEnd: z.string().optional(),
  ean: z.string().optional(),
  refId: z.string().optional(),
  status_order: z.string().optional(),
  cursor: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),

  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),

  // souceId: z.number().min(1, { message: 'ID do canal é obrigatório.' }),
});

export type FindInteractionSchema = z.infer<typeof findInteractionSchema>;

export const findInteractionTeucardSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  dateBegin: z.string().optional(), // Pode validar formato de data se quiser
  dateEnd: z.string().optional(),
  cursor: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});

export type FindInteractionTeucardSchema = z.infer<
  typeof findInteractionTeucardSchema
>;

export class IntrationDto {
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

  @IsOptional()
  @IsString({ message: 'O customer deve ser uma string' })
  @ApiProperty({
    description: 'ID do customer ',
    example: '123',
  })
  customer_id?: string;
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
