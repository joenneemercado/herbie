import { z } from 'zod';

//todo consultar source
export const findSourcechema = z.object({
  status_id: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'status_id deve ser um número válido',
    }),
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

export type FindSourcechema = z.infer<typeof findSourcechema>;
