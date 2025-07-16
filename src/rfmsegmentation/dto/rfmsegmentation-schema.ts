import { z } from 'zod';

//todo consultar segmentationchema
export const findRfmSegmentationchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
});

export type FindRfmSegmentationchema = z.infer<typeof findRfmSegmentationchema>;
