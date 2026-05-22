import { z } from "zod";

export const signupSchema = z.object({
  email: z.email().trim(),

  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email().trim(),

  password: z.string().min(6),
});

export const jwtPayloadSchema = z.object({
  userId: z.number().positive(),

  email: z.email().trim(),
});

export type JwtPayload =
  z.infer<typeof jwtPayloadSchema>;

export type SignUpInput =
  z.infer<typeof signupSchema>;

export type LoginInput =
  z.infer<typeof loginSchema>;