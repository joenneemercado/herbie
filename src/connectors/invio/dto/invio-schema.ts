import { z } from 'zod';

export const findAllInvioDtoDtoSchema = z.object({
  // Se organization_id não for enviado, o erro será de ausência
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  channelId: z.string().min(1, { message: 'ChannelId é obrigatório.' }),
  name: z.string().optional(),
  nameOrderBy: z.string().optional(),
  orderDirection: z.string().optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});
export type FindAllInvioDtoDtoSchema = z.infer<typeof findAllInvioDtoDtoSchema>;
