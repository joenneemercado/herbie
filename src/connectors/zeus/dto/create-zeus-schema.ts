import { z } from 'zod';

  export const createZeusSchema = z
  .object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
    email: z.string().email({ message: "E-mail inválido." }),
    phone: z.string().optional().nullish(),
    cpf: z
      .string()
      .min(11, { message: "CPF deve ter pelo menos 11 caracteres." })
      .max(14, { message: "CPF deve ter no máximo 14 caracteres." }),
    date_birth: z
      .string()
      .transform((value) => new Date(value))
      .optional()
      .nullish()
      .refine((date) => !isNaN(date.getTime()), { message: "Data de nascimento inválida." }),
    gender: z.string().optional().nullish(),
    marital_status: z.string().optional().nullish(),
    organization_id: z.string().min(1, { message: "ID da organização é obrigatório." }),
    address: z.object({
      street: z.string().optional().nullish(),
      postal_code: z.string().optional().nullish(),
      neighborhood: z.string().optional().nullish(),
      number: z.string().optional().nullish(), // Mantive string para permitir números alfanuméricos
      state: z.string().optional().nullish(),
      city: z.string().optional().nullish(),
      complement: z.string().optional().nullish(),
    }),
  })
  .refine((data) => /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf), {
    message: "CPF inválido. Deve estar no formato correto (apenas números ou com pontuação).",
    path: ["cpf"],
  });

export type CreateZeusSchema = z.infer<typeof createZeusSchema>;

export const createZeusArraySchema = z.array(createZeusSchema);

export type CreateZeusArraySchema = z.infer<typeof createZeusArraySchema>;
