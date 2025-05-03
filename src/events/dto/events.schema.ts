import { z } from 'zod';

//todo consultar events
export const findEventchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  id: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'id deve ser um número válido',
    }),
  page: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'page deve ser um número válido',
    })
    .default(1),
  limit: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'limit deve ser um número válido',
    })
    .default(10),
});

export type FindEventchema = z.infer<typeof findEventchema>;
