import { z } from 'zod';

export const findSegmentAudienceSchema = z.object({
  status_id: z.number().nullish().optional(),
  sellerName: z.string().optional(),
  total_start: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'total deve ser um número válido',
    }),
  total_end: z
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'total deve ser um número válido',
    }),
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
  //gender: z.string().nullish().optional(),
  gender: z
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
  //marital_status: z.string().nullish().optional(),
  marital_status: z
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

  dateBegin: z.string().optional(), // Pode validar formato de data se quiser
  dateEnd: z.string().optional(),
  //refId: z.string().optional(),
  refId: z
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
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
  date_created_start: z.string().optional(),
  date_created_end: z.string().optional(),
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

  source_id: z
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
  name: z.string().nullish(),
});

export type FindSegmentAudienceSchema = z.infer<
  typeof findSegmentAudienceSchema
>;
