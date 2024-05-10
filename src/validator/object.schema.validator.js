import joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
const validator = (schema) => (payload, res, funcName = "API",) =>{
    
    const {value, error} = schema.validate(payload)
    
    if(error?.details.length > 0)
    {
        let errorMessage = error.details.map(item => item.message)
        if(res)
        {
            return res.status(401).json(new ApiResponse (401, `${funcName} : Fields are incorrect or Empty`, errorMessage))
        }
        throw new ApiError (401, JSON.stringify(error?.details) || `${funcName} : Fields are incorrect or Empty`)
    }
    else
    {
        return value;
    }
}
const signupSchema = joi
.object({
    name : joi.string().min(6).max(20).trim().lowercase().required(),
    email : joi.string().email().min(6).max(50).lowercase().required(),
    password : joi.string().min(8).max(20).required(),
}).options({abortEarly: false});


const loginSchema = joi
.object({
    email : joi.string().email().min(6).max(50).lowercase().required(),
    password : joi.string().min(8).max(20).required(),
}).options({abortEarly: false});

const otpVerifySchema = joi
.object({
    otpCode : joi.number().required(),
}).options({abortEarly: false});

const forgetPasswordSchema = joi
.object({
    email : joi.string().email().min(6).max(50).lowercase(),
    password : joi.string().min(8).max(20),
    otpCode: joi.number()
}).options({abortEarly: false})

const EmailOTPSchema = joi
.object({
    email: joi.string().required()
}).options({abortEarly: false});


const deleteUserSchema = joi
.object({
    email: joi.string().required(),
    password:joi.string().min(8).max(20)
});


export const signUpValidator = validator(signupSchema);

export const loginValidator = validator(loginSchema);

export const otpVerifyValidator = validator(otpVerifySchema)

export const forgetPasswordValidator = validator(forgetPasswordSchema)

export const EmailOTPValidator=validator(EmailOTPSchema);

export const DeleteUserValidator = validator(deleteUserSchema);