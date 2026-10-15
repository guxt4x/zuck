import { z } from "zod";
import { parseAmountToCents } from "@/features/transactions/money";

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

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "O título da meta é obrigatório.").max(255),
  targetAmount: amountField,
  currentAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? parseAmountToCents(val) : 0)),
  targetDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => {
      if (!val) {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d;
      }
      return new Date(val);
    })
    .refine((date) => !isNaN(date.getTime()), "Data inválida."),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  goalId: z.string().trim().min(1, "ID da meta é obrigatório."),
  addedAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? parseAmountToCents(val) : undefined)),
  currentAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? parseAmountToCents(val) : undefined)),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
