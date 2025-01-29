import { z } from "zod";

export const CreateAudienceSchema = z
  .object({
    name: z.string().nullish(),
    statusId:z.number().nullish().optional(),
    createdBy:z.number().nullish(),
    organization_id:z.string().nullish(),
    date_birth_start: z.union([z.string(), z.array(z.string())]).nullish().optional(),
    date_birth_end: z.union([z.string(), z.array(z.string())]).nullish().optional(),
    gender:z.string().nullish().optional(),
    marital_status:z.string().nullish().optional(),
    date_created_start:z.union([z.string(), z.array(z.string())]).nullish().optional(),
    date_created_end:z.union([z.string(), z.array(z.string())]).nullish().optional(),
  })
  

  export const UpdateAudienceSchema = z.object({
    id: z.number(),
    public_id: z.string().optional().nullable(),
    nickname: z.string().optional().nullable(),
  });
  
  export type createAudienceSchema = z.infer<typeof CreateAudienceSchema>;
  export type updateAudienceSchema = z.infer<typeof UpdateAudienceSchema>;
  