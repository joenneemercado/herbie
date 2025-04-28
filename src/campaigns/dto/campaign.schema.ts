import { z } from 'zod';

export const createCampaignchema = z.object({
  id: z.string().nullish(),
  name: z.string().nullish(),
  message: z.string().nullish(),
  sendingBy: z.string().nullish(),
  statusId: z.number().nullish().optional(),
  createdAt: z.string().optional(),
  updatedAtz: z.string().optional(),
  createdBy: z.number().nullish().optional(),
  updatedBy: z.number().nullish().optional(),
  priority: z.number().nullish().optional(),
  channelId: z.number().nullish(),
  tags: z.union([z.string(), z.array(z.string())]).nullish(),
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  dateStart: z.string().nullish(),
  dateEnd: z.string().nullish(),
  jsonMeta: z.string().nullish(),
  subject: z.string().nullish(),
  // date_birth_start: z.union([z.string(), z.array(z.string())]).nullish().optional(),
  // date_birth_end: z.union([z.string(), z.array(z.string())]).nullish().optional(),
  // gender:z.string().nullish().optional(),
  // marital_status:z.string().nullish().optional(),
  // date_created_start:z.union([z.string(), z.array(z.string())]).nullish().optional(),
  // date_created_end:z.union([z.string(), z.array(z.string())]).nullish().optional(),
  idAudience: z.union([z.string(), z.array(z.string())]).nullish(),
  customer_unified_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'customer_unified_id deve ser um número válido',
    }),
  cursor: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});

export const UpdateCampaignSchema = z.object({
  id: z.number(),
  // public_id: z.string().optional().nullable(),
  // nickname: z.string().optional().nullable(),
});

export type CreateCampaignSchema = z.infer<typeof createCampaignchema>;
export type updateCampaignSchema = z.infer<typeof UpdateCampaignSchema>;

export const campaingContactDtochema = z.object({
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
  cursor: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});

export type CampaingContactDtochema = z.infer<typeof campaingContactDtochema>;
