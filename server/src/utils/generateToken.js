const jwt = require('jsonwebtoken')

function generateToken({emailId,userId}){
    const token = jwt.sign(
        {emailId,userId},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    return token
}

module.exports = generateToken