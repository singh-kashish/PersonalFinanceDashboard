const z = require('zod')

const signupSchema = z.object({
    email: z.email(),
    name: z.string().optional(),
    password: z.string().min(6)
})

module.exports = {signupSchema}