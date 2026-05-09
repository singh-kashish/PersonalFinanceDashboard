// auth.controller
const {signupSchema,loginSchema} = require("../validators/auth.validator");

const {signupService, loginService} = require("../services/auth.service")

const signupController = async (req,res) =>{
    try{
        // Validate req body
        const validatedData = signupSchema.safeParse(req.body)
        
        if(!validatedData.success){
            return res.status(400).json({message:validatedData.error.issues[0].message || 'Validation Error'})
        }
        
        const result = await signupService(validatedData.data);

        // Send response
        res.status(201).json(result)
        
    } catch(error){
        return res.status(400).json({message:error.message})
    }
};

const loginController = async (req,res) =>{
    try{
        // Validate req.body with loginSchema
        const parsedBody = loginSchema.safeParse(req.body);
        // If incorrect schema send res(400)
        if(!parsedBody.success){
            return res.status(400).json({message:parsedBody.error.issues[0].message || 'Validation Error'})
        }
        // If correct schema, call service
        const result = await loginService(parsedBody.data)

        // Send response
        res.status(200).json(result)

    }catch(error){
        return res.status(400).json({message:error.message})
    }
}

const currentUserController = async (req,res) =>{
    try{
        return res.status(200).json({user:req.user});
    } catch(error){
        return res.status(400).json({message:'JWT issue'})
    }
}

module.exports = {signupController,loginController,currentUserController}