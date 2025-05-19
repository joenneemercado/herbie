import { z } from 'zod';

export const createTagschema = z.object({
  name: z.string().nullish(),
  organization_id: z.string().nullish(),
  createdBy: z.number().nullish(),
});

export const UpdateTagsSchema = z.object({
  id: z.number(),
  // public_id: z.string().optional().nullable(),
  // nickname: z.string().optional().nullable(),
});

export const createContactTagschema = z.object({
  idTag: z.number().nullish(),
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  customer_unified_id: z.number().nullish(),
});

export type CreateTagsSchema = z.infer<typeof createTagschema>;
export type CreateContactTagsSchema = z.infer<typeof createContactTagschema>;

export type updateTagsSchema = z.infer<typeof UpdateTagsSchema>;
