import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("E-mail com formato inválido.")
    .max(255),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
  name: z
    .string()
    .trim()
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("E-mail com formato inválido.")
    .max(255),
  password: z
    .string()
    .min(1, "A senha é obrigatória.")
    .max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
