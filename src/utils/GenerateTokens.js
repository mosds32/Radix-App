import jwt from "jsonwebtoken";
import _ from "lodash"

export const generateToken = (payload) =>{
    try
    {
        // check payload should not be empty and is object
        // generate Token with payload and Jwt Secret
        // return Token

        const isNotPayload = _.isEmpty(payload) ||  (!_.isObject(payload))
        
        if(isNotPayload)
        {
            console.log(401, "GenerateToken : Payload is empty or not defined type")
        }  

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET)

        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn : '15d'
        })

        if(!accessToken || !refreshToken)
        {
            console.log(401, "GenerateToken : Token is not generated");
        }
        
        return {accessToken, refreshToken}
    }
    catch(err)
    {
        console.log(403, "GenerateToken : Something went wrong")
    }
}