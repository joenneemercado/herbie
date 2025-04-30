import { z } from 'zod';

export const findSegmentAudienceSchema = z.object({
  status_id: z.number().nullish().optional(),
  created_by: z.number().nullish(),
  organization_id: z.string().nullish(),
  date_birth_start: z
    .union([z.string(), z.array(z.string())])
    .nullish()
    .optional(),
  date_birth_end: z
    .union([z.string(), z.array(z.string())])
    .nullish()
    .optional(),
  gender: z.string().nullish().optional(),
  marital_status: z.string().nullish().optional(),
  dateBegin: z.string().optional(), // Pode validar formato de data se quiser
  dateEnd: z.string().optional(),
  sellerName: z.string().nullish().optional(),
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

export type FindSegmentAudienceSchema = z.infer<
  typeof findSegmentAudienceSchema
>;
