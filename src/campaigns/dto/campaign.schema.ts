import { z } from "zod";

export const CreateCampaignchema = z
  .object({
    name: z.string().nullish(),
    message: z.string().nullish(),
    sendingBy: z.string().nullish(),
    statusId: z.number().nullish().optional(),
    createdAt: z.string(),
    updatedAtz: z.string(),
    createdBy: z.number().nullish(),
    updatedBy: z.number().nullish(),
    priority: z.number().nullish(),
    channelId: z.number().nullish(),
    tags: z.union([z.string(), z.array(z.string())]).nullish(),
    organization_id: z.string().nullish(),
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
  })

export const UpdateCampaignSchema = z.object({
  id: z.number(),
  // public_id: z.string().optional().nullable(),
  // nickname: z.string().optional().nullable(),
});

export type createCampaignSchema = z.infer<typeof CreateCampaignchema>;
export type updateCampaignSchema = z.infer<typeof UpdateCampaignSchema>;
