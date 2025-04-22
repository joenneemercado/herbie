import { z } from 'zod';

export const findInteractionSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  seller: z.string(),
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
});

export type FindInteractionSchema = z.infer<typeof findInteractionSchema>;
