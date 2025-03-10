import { z } from 'zod';

// interacao de acumular
export const createInteractionAcumularZeusSchema = z.object({
  // organization_id
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  // cpf
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter pelo menos 11 caracteres.' })
    .max(14, { message: 'CPF deve ter no máximo 14 caracteres.' }),

  // total (opcional)
  total: z
    .number()
    .optional()
    .refine((val) => val === undefined || val >= 0, {
      message: 'O total deve ser um número não negativo.',
    }),

  // details (opcional)
  details: z
    .object({
      // idVenda
      idVenda: z.string().min(1, { message: 'O idVenda deve ser uma string.' }),

      // vlCupom
      vlCupom: z.number().min(0, { message: 'O vlCupom deve ser um número.' }),

      // dataVenda
      dataVenda: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'A dataVenda deve ser uma data válida.',
      }),

      // serie
      serie: z.string().min(1, { message: 'A serie deve ser uma string.' }),

      // loja
      loja: z.string().min(1, { message: 'A loja deve ser uma string.' }),

      // celular
      celular: z
        .string()
        .min(1, { message: 'O celular deve ser uma string válida.' }),

      // vlCash
      vlCash: z.number().min(0, { message: 'O vlCash deve ser um número.' }),

      // primeiraCompra
      primeiraCompra: z.boolean().refine((val) => typeof val === 'boolean', {
        message: 'O primeiraCompra deve ser um booleano.',
      }),

      // rede
      rede: z.string().min(1, { message: 'O idRede deve ser uma string.' }),

      // qtProd
      qtProd: z.number().min(0, { message: 'O qtProd deve ser um número.' }),

      // cashAtacac
      cashAtacac: z
        .number()
        .min(0, { message: 'O cashAtacac deve ser um número.' }),

      // tipoPessoa
      tipoPessoa: z
        .string()
        .min(1, { message: 'O tipoPessoa deve ser uma string.' }),

      // qtUnidades
      qtUnidades: z
        .number()
        .min(0, { message: 'O qtUnidades deve ser um número.' }),

      // vlTroco
      vlTroco: z.number().min(0, { message: 'O vlTroco deve ser um número.' }),
    })
    .optional(),
});

export type CreateInteractionAcumularZeusSchema = z.infer<
  typeof createInteractionAcumularZeusSchema
>;

// interacao de resgate
export const createInteractionResgatarZeusSchema = z.object({
  // organization_id
  organization_id: z
    .string()
    .min(1, { message: 'ID da organização é obrigatório.' }),

  // cpf
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter pelo menos 11 caracteres.' })
    .max(14, { message: 'CPF deve ter no máximo 14 caracteres.' }),

  // total (opcional)
  total: z
    .number()
    .optional()
    .refine((val) => val === undefined || val >= 0, {
      message: 'O total deve ser um número não negativo.',
    }),

  // details (opcional)
  details: z
    .object({
      // vlCash
      vlDisponivel: z
        .number()
        .min(0, { message: 'O valor vlDisponivel deve ser um número.' }),

      // dataVenda
      dataVenda: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'A dataVenda deve ser uma data válida.',
      }),

      // loja
      loja: z.string().min(1, { message: 'A loja deve ser uma string.' }),

      // vlCash
      vlCash: z.number().min(0, { message: 'O vlCash deve ser um número.' }),

      // primeiraCompra
      primeiraCompra: z.boolean().refine((val) => typeof val === 'boolean', {
        message: 'O primeiraCompra deve ser um booleano.',
      }),

      // rede
      rede: z.string().min(1, { message: 'O idRede deve ser uma string.' }),

      // tipoPessoa
      tipoPessoa: z
        .string()
        .min(1, { message: 'O tipoPessoa deve ser uma string.' }),
    })
    .optional(),
});

export type CreateInteractionResgatarZeusSchema = z.infer<
  typeof createInteractionResgatarZeusSchema
>;
