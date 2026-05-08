const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = require('../lib/prisma')

const signupService = async ({email,name,password}) =>{
    // Check existing user
    const existingUser = await prisma.user.findUnique({where:{email,}});
    if(existingUser)throw new Error("User already exists")
    // Hash Password
    const hashedPassword = await bcrypt.hash(password,10);
    // Create User
    const user = await prisma.user.create({
       data:{
            email,
            password: hashedPassword,
            name
        }
    })
    // Generate Token
    const token = jwt.sign({
        userId: user.id,
        email: user.email
    },process.env.JWT_SECRET,{
        expiresIn:"1d",
    });
    // Return Response
    return {
        token,
        user:{
            id: user.id,
            email: user.email,
            name: user.name
        }
    }
}
module.exports = {signupService}