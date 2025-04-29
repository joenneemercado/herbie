import { z } from 'zod';

//Todo criar campanha
export const createCampaignDtochema = z.object({
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
  typeMessage: z.number().nullish(),
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  dateStart: z.string().nullish(),
  dateEnd: z.string().nullish(),
  jsonMeta: z.string().nullish(),
  subject: z.string().nullish(),
  tags: z.union([z.number(), z.array(z.number())]).optional(),
  idAudience: z.union([z.number(), z.array(z.number())]).optional(),
});
export type CreateCampaignDtoSchema = z.infer<typeof createCampaignDtochema>;

//todo consultar campanha
export const findCampaignchema = z.object({
  name: z.string().nullish(),
  createdBy: z.number().nullish().optional(),
  statusId: z.number().nullish().optional(),
  id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'id deve ser um número válido',
    }),
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
});

export type FindCampaignchema = z.infer<typeof findCampaignchema>;

//todo consulta do details da campanha
export const campaingDetailsDtochema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'id deve ser um número válido',
    }),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});
export type CampaingDetailsDtochema = z.infer<typeof campaingDetailsDtochema>;

//todo consulta do contato unificado da campanha
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
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});

export type CampaingContactDtochema = z.infer<typeof campaingContactDtochema>;

export const UpdateCampaignSchema = z.object({
  id: z.number(),
});

export type updateCampaignSchema = z.infer<typeof UpdateCampaignSchema>;
