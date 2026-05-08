const {signupSchema} = require("../validators/auth.validator");

const {signupService} = require("../services/auth.service")

const signupController = async (req,res) =>{
    try{
        // Validate req body
        const validatedData = signupSchema.safeParse(req.body)
        console.log(validatedData);
        if(!validatedData.success){
            return res.status(400).json({message:validatedData.error.issues[0].message || 'Validation Error'})
        }
        
        const result = await signupService(validatedData.data);

        // Send response
        res.status(201).json(result)
        //Call Service
        
    } catch(error){
        return res.status(400).json({message:error.message})
    }
};

module.exports = signupController