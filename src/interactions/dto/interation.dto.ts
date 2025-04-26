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
