import jwt from 'jsonwebtoken'
import { JwtPayload } from '../validators/auth.validator'
import { env } from '../config/env'

function generateToken({email,userId}:JwtPayload){
    const token = jwt.sign(
        {email,userId},
        env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    return token
}

export default generateToken