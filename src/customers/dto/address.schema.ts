import { z } from 'zod';

export const AddressSchema = z.object({
  address_ref: z.string(),
  neighborhood: z.string().optional().nullish(),
  street: z.string().optional().nullish(),
  city: z.string(),
  state: z.string(),
  country: z.string().default('BRA'),
  postal_code: z.string().optional().nullish(),
  address_type: z.string().optional().nullish(),
  is_default: z.boolean().optional().nullish(),
});

export const AddressCreateSchema = z.object({
  organization_id: z.string().cuid(),
  customer_id: z.string().cuid(),
  address_ref: z.string(),
  neighborhood: z.string().optional().nullish(),
  street: z.string().optional().nullish(),
  city: z.string(),
  state: z.string(),
  country: z.string().default('BRA'),
  postal_code: z.string().optional().nullish(),
  address_type: z.string().optional().nullish(),
  is_default: z.boolean().optional().nullish(),
});

export type createAddressSchema = z.infer<typeof AddressCreateSchema>;
