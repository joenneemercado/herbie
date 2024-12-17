import { z } from 'zod';
import { AddressSchema } from './address.schema';

export const CreateCustomerSchema = z
  .object({
    nickname: z.string().optional().nullish(),
    firstname: z.string().min(1),
    lastname: z.string().optional().nullish(),
    email: z.string().email(),
    phone: z.string().optional().nullish(),
    cpf: z.string().min(11).max(14), // Assuming CPF has a length constraint
    cnpj: z.string().optional().nullish(),
    company_name: z.string().optional().nullable(),
    trading_name: z.string().optional().nullish(),
    date_birth: z
      .string()
      .transform((value) => new Date(value))
      .optional()
      .nullish(),
    gender: z.string().optional().nullish(),
    marital_status: z.string().optional().nullish(),
    has_child: z.number().default(0),
    last_updated_system: z.string().optional().nullish(),
    created_by: z.number(),
    organization_id: z.string().min(1),
  })
  .refine((data) => !(data.cpf && data.cnpj), {
    message: 'CPF e CNPJ não podem ser enviados juntos',
    path: ['cpf', 'cnpj'], // Indica onde o erro ocorrerá
  });

export const UpdateCustomerSchema = z.object({
  id: z.number(),
  public_id: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  firstname: z.string().min(1).optional(),
  lastname: z.string().optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  cpf: z.string().min(11).max(14).optional(),
  cnpj: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  trading_name: z.string().optional().nullable(),
  date_birth: z
    .string()
    .transform((value) => new Date(value))
    .optional()
    .nullable(),
  gender: z.string().optional().nullable(),
  organization_id: z.string().min(1).optional(),
  updated_at: z.date().optional(),
  last_updated_system: z.string().optional().nullish(),
  marital_status: z.string().optional().nullish(),
  has_child: z.number().optional(),
});

export const CreateCustomerWithAddressSchema = CreateCustomerSchema.and(
  z.object({
    addresses: z.array(AddressSchema),
  }),
);

export type createCustomerSchema = z.infer<typeof CreateCustomerSchema>;
export type createCustomerWithAddressSchema = z.infer<
  typeof CreateCustomerWithAddressSchema
>;
export type updateCustomerSchema = z.infer<typeof UpdateCustomerSchema>;
