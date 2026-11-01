import { z } from "zod";
import { parseAmountToCents } from "./money";

const amountField = z.union([z.number(), z.string()]).transform((val, ctx) => {
  try {
    return parseAmountToCents(val);
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : "Valor monetário inválido.",
    });
    return z.NEVER;
  }
});

export const registerExpenseSchema = z.object({
  amount: amountField,
  description: z.string().trim().min(1, "A descrição é obrigatória.").max(255),
  categorySlug: z.string().trim().min(1).default("outros"),
  date: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

export type RegisterExpenseInput = z.infer<typeof registerExpenseSchema>;

export const registerIncomeSchema = z.object({
  amount: amountField,
  description: z.string().trim().min(1, "A descrição é obrigatória.").max(255),
  categorySlug: z.string().trim().min(1).default("outros"),
  date: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

export type RegisterIncomeInput = z.infer<typeof registerIncomeSchema>;

export const balanceQuerySchema = z.object({
  startDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export type BalanceQueryInput = z.infer<typeof balanceQuerySchema>;

export const listTransactionsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  type: z.enum(["expense", "income", "transfer"]).optional(),
  categorySlug: z.string().optional(),
});

export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;

export const categoryExpensesSchema = z.object({
  startDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export type CategoryExpensesInput = z.infer<typeof categoryExpensesSchema>;

export const deleteTransactionSchema = z.object({
  transactionId: z.string().trim().optional(),
  all: z.boolean().default(false),
  confirmed: z.boolean().default(false),
});

export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;

