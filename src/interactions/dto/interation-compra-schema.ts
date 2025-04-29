import { z } from 'zod';

export const interactionCompraSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  sellerName: z.string().optional(),
  dateBegin: z.string().optional(), // Pode validar formato de data se quiser
  dateEnd: z.string().optional(),
  ean: z.string().optional(),
  refId: z.string().optional(),
  status_order: z.string().optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});

export type InteractionCompraSchema = z.infer<typeof interactionCompraSchema>;
