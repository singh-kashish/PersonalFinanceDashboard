const z = require('zod')

const signupSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(6)
})

const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6)
})

module.exports = {signupSchema,loginSchema}