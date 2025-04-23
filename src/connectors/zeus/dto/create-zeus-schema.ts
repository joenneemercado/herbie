import { z } from 'zod';

export const createZeusSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Nome deve ter pelo menos 1 caracteres.' }),
    email: z.string().email({ message: 'E-mail inválido.' }),
    phone: z.string(),
    cpf: z
      .string()
      .trim()
      .transform((value) => (value === '' ? undefined : value)) // Converte "" para undefined
      .optional()
      .refine((value) => value === undefined || /^\d{11}$/.test(value), {
        message: 'CPF inválido. Deve conter exatamente 11 números.',
        path: ['cpf'],
      }),

    cnpj: z
      .string()
      .trim()
      .transform((value) => (value === '' ? undefined : value))
      .optional()
      .refine((value) => value === undefined || /^\d{14}$/.test(value), {
        message: 'CNPJ inválido. Deve conter exatamente 14 números.',
        path: ['cnpj'],
      }),
    date_birth: z
      .string()
      .transform((value) => new Date(value))
      .optional()
      .nullish(),
    gender: z.string().optional(),
    marital_status: z.string().optional(),
    date_of_inclusion: z.string().transform((value) => new Date(value)),
    date_registration_full: z
      .string()
      .trim()
      .transform((value) => (value === '' ? undefined : value))
      .optional()
      .refine((value) => value === undefined || !isNaN(Date.parse(value)), {
        message:
          'A data que o cliente concluiu o cadastro deve ser uma data válida.',
        path: ['date_registration_full'],
      }),
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
  .refine((data) => data.cpf || data.cnpj, {
    message: 'É necessário informar CPF ou CNPJ.',
    path: ['cpf', 'cnpj'],
  });
// .refine((data) => /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf), {
//   message: 'CPF inválido. Deve estar no formato correto (apenas números).',
//   path: ['cpf'],
// });

export type CreateZeusSchema = z.infer<typeof createZeusSchema>;

export const createZeusArraySchema = z.array(createZeusSchema);

export type CreateZeusArraySchema = z.infer<typeof createZeusArraySchema>;
