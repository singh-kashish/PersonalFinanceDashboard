//auth.service
const bcrypt = require('bcryptjs')

const generateToken = require('../utils/generateToken');

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
    const token = generateToken({userId:user.id,email:user.email});
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

const loginService = async({email,password}) =>{
        // Use prisma to query for email, if email not found return and reject;
     const existingUser = await prisma.user.findUnique({where:{email,}})
     if(!existingUser){
        throw new Error(`Invalid Credentials`);
     }
     // else get hashed password from db and use bcrypt.compare
     const hashedPassword = existingUser.password;
     const userId = existingUser.id;
     const userName = existingUser.name;

     const correctPassword = await bcrypt.compare(password,hashedPassword);
    // If the comparison is successful use jwt to sign token with user details and return token with user details else reject
     if(!correctPassword){
        throw new Error("Invalid Credentials")
     } else{
        const token = generateToken({emailId:email,userId})
        return {
            token,
            user:{
                id:userId,
                email:email,
                name: userName
            }};
     }
     
}

module.exports = {signupService, loginService}