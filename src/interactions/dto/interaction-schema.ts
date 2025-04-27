import { z } from 'zod';

export const createInteractionSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter pelo menos 11 caracteres.' })
    .max(14, { message: 'CPF deve ter no máximo 14 caracteres.' }),
  type: z
    .string()
    .min(3, { message: "O campo 'type' deve ter pelo menos 3 caracteres." }),
  event_id: z.number(),
  total: z.number().optional().nullish(),
  details: z.record(z.any()).optional(),
});

export type CreateInteractionSchema = z.infer<typeof createInteractionSchema>;

export const interactionSchema = z.object({
  // Se organization_id não for enviado, o erro será de ausência
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  // Transformação do source_id para número
  source_id: z
    .string()
    .transform((val) => Number(val)) // Converte de string para número
    .refine((val) => !isNaN(val), { message: 'O source_id deve ser um número' })
    .pipe(z.number().min(1, { message: 'ID da origem é obrigatório.' })),

  type: z.string().optional(),

  customer_unified_id: z.number().optional(),

  status_id: z.number().optional(),

  created_by: z.number().optional(),

  event_id: z.number().optional().nullish(),
});

export type InteractionSchema = z.infer<typeof interactionSchema>;

export const intrationDtoSchema = z.object({
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),
  // Aqui fazemos a transformação para número diretamente
  // source_id: z
  //   .string()
  //   .refine((val) => !isNaN(Number(val)), {
  //     message: 'O source_id deve ser um número',
  //   }) // Refina para garantir que é um número válido
  //   .transform((val) => Number(val)) // Transforma a string em número
  //   .pipe(z.number().min(1, { message: 'ID da origem é obrigatório.' })), // Adiciona a validação para o número

  cursor: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),

  customer_unified_id: z
    .string()
    .optional()
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num))
        throw new Error('O customer_unified_id deve ser um número');
      return num;
    })
    .refine((val) => typeof val === 'number', {
      message: 'O customer_unified_id deve ser um número válido',
    }),
});

export type IntrationDtoSchema = z.infer<typeof intrationDtoSchema>;
