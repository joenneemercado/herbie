import { z } from 'zod';

export const findAudienceContactsSchema = z.object({
  organization_id: z.string().nullish(),
  id: z.string().nullish(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
});
export type FindAudienceContactsSchema = z.infer<
  typeof findAudienceContactsSchema
>;
