import { z } from 'zod';

// interacao de acumular
export const createInteractionAcumularZeusSchema = z
  .object({
    // organization_id
    organization_id: z
      .string()
      .min(1, { message: 'ID da organização é obrigatório.' }),

    // cpf
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
        idVenda: z
          .string()
          .min(1, { message: 'O idVenda deve ser uma string.' })
          .optional(),
        vlCupom: z
          .number()
          .min(0, { message: 'O vlCupom deve ser um número.' })
          .optional(),
        dataVenda: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'A dataVenda deve ser uma data válida.',
          })
          .optional(),
        serie: z
          .string()
          .min(1, { message: 'A serie deve ser uma string.' })
          .optional(),
        loja: z
          .string()
          .min(1, { message: 'A loja deve ser uma string.' })
          .optional(),
        celular: z
          .string()
          .min(1, { message: 'O celular deve ser uma string válida.' })
          .optional(),
        vlCash: z
          .number()
          .min(0, { message: 'O vlCash deve ser um número.' })
          .optional(),
        primeiraCompra: z
          .string()
          .min(1, { message: 'A primeira e deve ser uma string.' })
          .optional(),
        rede: z
          .string()
          .min(1, { message: 'O idRede deve ser uma string.' })
          .optional(),
        qtdProd: z
          .number()
          .min(0, { message: 'O qtProd deve ser um número.' })
          .optional(),
        cashAtacac: z
          .string()
          .min(1, { message: 'cashAtacac deve ser uma string válida.' })
          .optional(),
        tipoPessoa: z
          .string()
          .min(1, { message: 'O tipoPessoa deve ser uma string.' })
          .optional(),
        qtUnidades: z
          .number()
          .min(0, { message: 'O qtUnidades deve ser um número.' })
          .optional(),
        vlTroco: z
          .number()
          .min(0, { message: 'O vlTroco deve ser um número.' })
          .optional(),
        produtos: z
          .array(
            z.object({
              valor_cashback: z
                .number()
                .min(0, { message: 'O valor_cashback deve ser um número' }),
              valor: z
                .number()
                .min(0, { message: 'O valor deve ser um número' }),
              codigoEAN: z
                .string()
                .min(1, { message: 'O codigoEAN deve ser uma string' }),
              codigo: z
                .string()
                .min(1, { message: 'O código deve ser uma string' }),
              unidade: z
                .string()
                .min(1, { message: 'A unidade deve ser uma string' }),
              quantidade: z
                .number()
                .min(0, { message: 'A quantidade deve ser um número' }),
              descricao: z
                .string()
                .min(1, { message: 'A descrição deve ser uma string' }),
            }),
          )
          .optional(),
      })
      .optional(),
  })
  .refine((data) => data.cpf || data.cnpj, {
    message: 'É necessário informar CPF ou CNPJ.',
    path: ['cpf', 'cnpj'],
  });

export type CreateInteractionAcumularZeusSchema = z.infer<
  typeof createInteractionAcumularZeusSchema
>;

// interacao de resgate
export const createInteractionResgatarZeusSchema = z
  .object({
    // organization_id
    organization_id: z
      .string()
      .min(1, { message: 'ID da organização é obrigatório.' }),

    // cpf
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
          .min(0, { message: 'O valor vlDisponivel deve ser um número.' })
          .optional(),

        // dataVenda
        dataVenda: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'A dataVenda deve ser uma data válida.',
          })
          .optional(),

        // loja
        loja: z
          .string()
          .min(1, { message: 'A loja deve ser uma string.' })
          .optional(),

        // vlCash
        vlCash: z
          .number()
          .min(0, { message: 'O vlCash deve ser um número.' })
          .optional(),

        // primeiraCompra
        primeiraCompra: z
          .string()
          .min(1, { message: 'A primeira e deve ser uma string.' })
          .optional(),

        // rede
        rede: z
          .string()
          .min(1, { message: 'O idRede deve ser uma string.' })
          .optional(),

        // tipoPessoa
        tipoPessoa: z
          .string()
          .min(1, { message: 'O tipoPessoa deve ser uma string.' })
          .optional(),
      })
      .optional(),
  })
  .refine((data) => data.cpf || data.cnpj, {
    message: 'É necessário informar CPF ou CNPJ.',
    path: ['cpf', 'cnpj'],
  });

export type CreateInteractionResgatarZeusSchema = z.infer<
  typeof createInteractionResgatarZeusSchema
>;
