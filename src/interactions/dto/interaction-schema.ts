import { z } from 'zod';

export const interactionDtoSchema = z.object({
  // Se organization_id não for enviado, o erro será de ausência
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  customer_unified_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'customer_unified_id deve ser um número válido',
    }),

  customer_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'customer_id deve ser um número válido',
    }),

  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
  orderby: z.enum(['asc', 'desc']).optional(),
});

export type InteractionDtoSchema = z.infer<typeof interactionDtoSchema>;

export const intrationCustomerUnifiedDtoSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),

  customer_unified_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'customer_unified_id deve ser um número válido',
    }),
});

export type IntrationCustomerUnifiedDtoSchema = z.infer<
  typeof intrationCustomerUnifiedDtoSchema
>;
