import { z } from 'zod';

//todo consultar sellerchain
export const findSellerChainchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
});

export type FindSellerChainchema = z.infer<typeof findSellerChainchema>;
