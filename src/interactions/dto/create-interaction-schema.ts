import { z } from "zod";

export const createInteractionSchema = z
  .object({
    organization_id: z.string().min(1, { message: "ID da organização é obrigatório." }),
    cpf: z
      .string()
      .min(11, { message: "CPF deve ter pelo menos 11 caracteres." })
      .max(14, { message: "CPF deve ter no máximo 14 caracteres." }),
    type: z.string().min(3, { message: "O campo 'type' deve ter pelo menos 3 caracteres." }),
    event_id: z.number(),
    total: z.number().optional().nullish(),
    details: z.record(z.any()).optional()
  })

export type CreateInteractionSchema = z.infer<typeof createInteractionSchema>;