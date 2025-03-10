import { z } from 'zod';

export const createZeusSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Nome deve ter pelo menos 3 caracteres.' }),
    email: z.string().email({ message: 'E-mail inválido.' }),
    phone: z.string(),
    cpf: z
      .string()
      .min(11, { message: 'CPF deve ter pelo menos 11 caracteres.' })
      .max(14, { message: 'CPF deve ter no máximo 14 caracteres.' }),
    date_birth: z
      .string()
      .transform((value) => new Date(value))
      .optional()
      .nullish(),
    gender: z.string().optional(),
    marital_status: z.string().optional(),
    date_of_inclusion: z.string().transform((value) => new Date(value)),
    date_registration_full: z.string().transform((value) => new Date(value)),
    organization_id: z
      .string()
      .min(1, { message: 'ID da organização é obrigatório.' }),
    address: z.object({
      street: z.string(),
      postal_code: z.string(),
      neighborhood: z.string(),
      number: z.string(), // Mantive string para permitir números alfanuméricos
      state: z.string(),
      city: z.string(),
      complement: z.string().optional().nullish(),
      country: z.string().min(2, { message: 'País é obrigatório.' }),
    }),
  })
  .refine((data) => /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf), {
    message: 'CPF inválido. Deve estar no formato correto (apenas números).',
    path: ['cpf'],
  });

export type CreateZeusSchema = z.infer<typeof createZeusSchema>;

export const createZeusArraySchema = z.array(createZeusSchema);

export type CreateZeusArraySchema = z.infer<typeof createZeusArraySchema>;
