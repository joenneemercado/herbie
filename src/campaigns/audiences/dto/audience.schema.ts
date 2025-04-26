import { z } from 'zod';

export const createAudienceSchema = z.object({
  name: z.string().nullish(),
  statusId: z.number().nullish().optional(),
  createdBy: z.number().nullish(),
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
});

export const updateAudienceSchema = z.object({
  id: z.number(),
  public_id: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
});

export type CreateAudienceSchema = z.infer<typeof createAudienceSchema>;
export type UpdateAudienceSchema = z.infer<typeof updateAudienceSchema>;
