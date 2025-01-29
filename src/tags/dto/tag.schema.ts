import { z } from "zod";

export const CreateTagschema = z
  .object({
    name: z.string().nullish(),
    organization_id:z.string().nullish(),
    createdBy: z.number().nullish(),
  })

export const UpdateTagsSchema = z.object({
  id: z.number(),
  // public_id: z.string().optional().nullable(),
  // nickname: z.string().optional().nullable(),
});

export type createTagsSchema = z.infer<typeof CreateTagschema>;
export type updateTagsSchema = z.infer<typeof UpdateTagsSchema>;
