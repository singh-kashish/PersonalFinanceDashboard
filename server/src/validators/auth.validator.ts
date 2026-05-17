import {z} from 'zod'

const signupSchema = z.object({
    email: z.string().trim().email(),
    name: z.string().optional(),
    password: z.string().min(6)
})

const loginSchema = z.object({
    email:z.string().trim().email(),
    password:z.string().min(6)
})

export const jwtPayloadSchema = z.object({
    userId: z.number().positive(),
    email: z.string().trim().email()
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export type signUpInput =
  z.infer<typeof signupSchema>;
export type loginInput = z.infer<typeof loginSchema>

export {signupSchema,loginSchema};
