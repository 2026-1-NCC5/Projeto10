import { z } from "zod";


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Formato de email inválido")
      .max(255, "Email deve ter no máximo 255 caracteres"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .max(128, "Senha deve ter no máximo 128 caracteres")
      .regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter uma letra minúscula")
      .regex(/\d/, "Senha deve conter um número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter um caractere especial"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Nome da equipe é obrigatório")
    .max(80, "Nome deve ter no máximo 80 caracteres")
    .regex(/\S/, "Nome não pode ser apenas espaços"),
  description: z
    .string()
    .max(300, "Descrição deve ter no máximo 300 caracteres")
    .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type RegisterFormData = z.infer<typeof registerSchema>;

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
