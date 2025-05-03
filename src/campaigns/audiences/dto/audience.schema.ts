import { z } from 'zod';

export const createAudienceSchema = z.object({
  name: z.string().nullish(),
  status_id: z.number().nullish().optional(),
  created_by: z.number().nullish(),
  organization_id: z.string().nullish(),
  date_birth_start: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.map(String) : [String(val)];
        } catch {
          return [String(val)];
        }
      }
      return val.map(String);
    }),
  date_birth_end: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.map(String) : [String(val)];
        } catch {
          return [String(val)];
        }
      }
      return val.map(String);
    }),
  event_id: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.map(String) : [String(val)];
        } catch {
          return [String(val)];
        }
      }
      return val.map(String);
    }),

  souce_id: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.map(String) : [String(val)];
        } catch {
          return [String(val)];
        }
      }
      return val.map(String);
    }),
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
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
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
});

export type CreateAudienceSchema = z.infer<typeof createAudienceSchema>;
export type UpdateAudienceSchema = z.infer<typeof updateAudienceSchema>;
