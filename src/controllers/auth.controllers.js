import {prisma} from '../client/client.js';
import { ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { signUpValidator, loginValidator, otpVerifyValidator , forgetPasswordValidator, EmailOTPValidator, DeleteUserValidator} from '../validator/object.schema.validator.js';
import generateOTP from '../utils/GenerateOtp.js';
import { mail } from '../utils/Mail.js';
import { hashPassword } from '../utils/HashPassword.js';
import { generateToken } from '../utils/GenerateTokens.js';
import { cookieOptions } from '../config/CookieOption.js';
import { comparePassword } from '../utils/ComparePassword.js';
import pkg from 'lodash';
const {now} = pkg;
const {expression} = pkg;

export const signup = asyncHandler(async (req, res, next) => {
    try {
      const value = signUpValidator(req.body, res, "Signup");
      const { name, email, password } = value;
  
      const now = new Date();
  
      // Check if the user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          user_email: email,
        },
      });
  
      if (existingUser) {
        return res.status(200).json(new ApiResponse(200, "Signup User Already Exist"));
      }
  
      // Hash the password
      const hashedPassword = await hashPassword(password);
  
      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          user_name: name,
          user_email: email,
          user_password: hashedPassword,
          user_createdat: now,
          user_verify: 0,
          user_modifiedat: now,
        },
      });
  
      // Retrieve the newly created user to ensure it's created
      const currentUser = await prisma.user.findFirst({
        where: {
          user_email: newUser.user_email,
        },
      });
  
      if (!currentUser) {
        return res.status(401).json(new ApiResponse(401, "Signup not Created"));
      }
  
      // Generate the access token
      const { accessToken } = generateToken(currentUser);
      const otp = generateOTP();
  
      // Create OTP entry
      await prisma.otp.create({
        data: {
          otp_number: otp,
          otp_createdat: now,
          otp_modifiedat: now,
          user_user_id: currentUser.user_id,
        },
      });
  
      // Send OTP via email
      mail(currentUser.user_email, otp);
  
      // Create login entry
      await prisma.login.create({
        data: {
          login_status: 1,
          login_createdat: now,
          login_modifiedat: now,
          user_user_id: currentUser.user_id,
        },
      });
  
      // Assign the accessToken to the response user object
      currentUser.accessToken = accessToken;
  
      return res.status(200).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, "User Signup", currentUser));
  
    } catch (error) {
      // Log the error (you might want to use a logging library here)
      console.error(error);
      next(new ApiError(403, error?.message || "Error in Signup"));
    }
  });
  
export const login = asyncHandler(async(req, res, next) =>
{
    try
    {
       const value = loginValidator(req.body, res, "login");
       const {email, password} = value;
       const now = new Date();
       const findUser = await prisma.user.findFirst(
        {
            where:
            {
                user_email: email
            }
        }
       );
       if(!findUser)
        {
            return res.status(403).json(new ApiResponse(403, "User not Registered"));
        }
const isPasswordValid = await comparePassword(password, findUser.user_password, res);
if(!isPasswordValid)
    {
        return res.status(401).json(new ApiResponse(401, "User Login Password Mismatch"));
    }
const {accessToken} = generateToken(findUser);
const findlogin = await prisma.login.findFirst(
    {
        where:
        {
            user_user_id: findUser.user_id
        }
    }
);
 await prisma.login.update(
    {
        where:
        {
            login_id: findlogin.login_id
        },
        data:
        {
            login_status: 1,
            login_createdat: now,
            login_modifiedat: now,
            user_user_id: findUser.user_id
        }
    }
);



findUser.accessToken = accessToken;
return res.status(200).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, "Login SuccessFull", findUser));

    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "Error in Login");
    }
} );
export const otpVerify = asyncHandler(async(req, res, next)  =>
{
try
{
const {user_id, user_email}=req.user;
const {otpCode} = otpVerifyValidator(req.body, res,"OtpVerify");
const now = new Date();
const user = await prisma.user.findFirst(
    {
        where:
        {
            user_email: user_email
        }
    }
);
if(!user)
    {
        return res.status(200).json(new ApiResponse(404, "OTp Verify User not Found"));
    }
const otp = await prisma.otp.findFirst(
    {
where:
{
    user_user_id: user_id
},
orderBy:
{
    otp_createdat: 'desc'
}
    }
);
if(otp.otp_number!==parseInt(otpCode))
{
    return res.status(402).json(new ApiResponse(401, " OtpVerify: Your otp is wrong "));
}
const updatedUser = await prisma.user.update(
    {
        data:
        {
            user_verify:1,
            user_modifiedat: now
        },
        where:
        {
            user_id: user_id,
            user_email: user_email
        }
    }
);
if(!updatedUser.user_verify)
    {
        return res.status(401).json(new ApiResponse(401, "User Email Not Verify"));
    }

return res.status(200).json(new ApiResponse(200, "User Email Verify"));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Verify");
}


} );
export const forgetPassword = asyncHandler(async (req, res) => {
    try {
        const value = forgetPasswordValidator(req.body, res, "ForgetPassword");
        const { email, otpCode, password } = value;
        const now = new Date();
        if (email && !otpCode && !password) {
            const user = await prisma.user.findFirst({
                where: {
                    user_email: email
                }
            });

            if (!user) {
                return res.status(404).json(new ApiResponse(404, "ForgetPassword: User not found"));
            }

            const otpEmail = generateOTP();   
            const otpuser = await prisma.otp.findFirst(
                {
                    where:
                    {
                        user_user_id: user.user_id
                    }
                }
            )
            const emailOtp = await prisma.otp.update({
                data: { otp_number: parseInt(otpEmail),
                     otp_modifiedat: now },
                where: { otp_id: otpuser.otp_id }
            });

            if (emailOtp) {
                await mail(user.user_email, otpEmail);
                return res.status(200).json(new ApiResponse(200, "OTP Sent"));
            }
        }  if (otpCode && !email && !password) {
            const otpMail = await prisma.otp.findFirst({
                where: { otp_number: parseInt(otpCode) }
            });

            if (!otpMail) {
                return res.status(404).json(new ApiResponse(404, "ForgetPassword: OTP not found"));
            }

            const userId = otpMail.user_user_id;
            const updatedUser = await prisma.user.update({
                where: { user_id: userId },
                data: { user_verify: 1, user_modifiedat: now }
            });

            if (updatedUser) {
                return res.status(200).json(new ApiResponse(200, "User Verified"));
            }
        }  if (password && email && !otpCode) {
            const finderUser = await prisma.user.findFirst({ where: { user_email: email } });
            const hashedPassword = await hashPassword(password);
            const updatedUserPassword = await prisma.user.update({
                where: { user_id: finderUser.user_id },
                data: { user_password: hashedPassword, user_modifiedat: now }
            });

            if (updatedUserPassword) {
                const accessToken = generateToken(updatedUserPassword)?.accessToken;
                return res.status(200).cookie("accessToken", accessToken, cookieOptions)
                    .json(new ApiResponse(200, "Password Changed", { accessToken }));
            }
        }

        // If none of the above conditions are met, return error response
        return res.status(400).json(new ApiResponse(400, "ForgetPassword: Invalid request"));

    } catch (err) {
        throw new ApiError(403, err?.message || "ForgetPassword: Something went wrong");
    }
});

export const resendOtp = asyncHandler(async(req, res, next)  =>
{
try
{
    const value = await EmailOTPValidator(req.body, res, "EmailOtp");
    const {email} = value;
    const now = new Date();
    const otp = generateOTP();
    const user = await prisma.user.findFirst(
        {
            where:
            {
                user_email: email
            }
        }
    );
    if(!user)
        {
            return res.status(200).json(new ApiResponse(200, "Resend Otp! User not Found"));
        }
       const userId = user.user_id;
       const otpFinder = await prisma.otp.findFirst(
        {
            where:
            {
                user_user_id: parseInt(userId)
            }
        }
       );

     const updatedUser = await prisma.otp.update(
        {
            where:
            {
                otp_id: otpFinder.otp_id
            },
            data:
            {
                otp_number: otp,
                otp_modifiedat: now
            }
        }
     );
     if(!updatedUser)
        {
            return res.status(401).json(new ApiResponse(401, "Resend: Otp Resend Failed"));
        }
      if(parseInt(user.user_verify))
        {
            return res.status(200).json(new ApiResponse(200, "User Already Verify"));
        }  
        await mail(user.user_email, otp);
        return res.status(200).json(new ApiResponse(200, "Resend OTp Successfully"));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Resend Otp" );
}

});

export const logout = asyncHandler(async(req, res, next) =>
{
try
{
const {user_id} = req.user;
const now = new Date();
const findLogin = await prisma.login.findFirst(
    {
        where:
        {
            user_user_id:user_id
        }
    }
);
const userlogin = await prisma.login.update(
    {
        where:
        {
            login_id: findLogin.login_id
        },
        data:
        {
            login_status:0,
            login_modifiedat: now
        }
    }
);
if(userlogin.login_status!==0)
    {
return res.status(401).json(new ApiResponse(401, "User Logout Failed"));
    }

    return res.status(200).clearCookie("accessToken"
    ).json(new ApiResponse(200, "UserLogout: User SuccessFully Logout "));
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Logout");
}


});

export const userAccountDeletion = asyncHandler(async(req, res, next) =>
{
try
{
    const value = DeleteUserValidator(req.body, res, "DeleteUser");
const {email, password} = value;
const {user_id} = req.user;
const now = new Date();
const user = await prisma.user.findFirst(
    {
        where:
        {
            user_id: user_id,
            user_email:email
        }
    }
);
const isPasswordValid = await comparePassword(password, user.user_password, res);
if(!isPasswordValid)
    {
        return res.status(401).json(new ApiResponse(401, "User Password Mismatch"));
    }
const deletedUser = await prisma.user.update(
    {
        where:
        {
            user_id: user.user_id,
            user_email: user.user_email
        },
        data:
        {
            user_modifiedat: now
        }
    }
);
if(!deletedUser)
    {
        return res.status(401).json(new ApiResponse(401, "User Account Deletion"));
    }
return res.status(200).json(new ApiResponse(200, "User Account Deletion"));

}
catch(error)
{
    throw new ApiError(403, error?.message  || "Error in Account Deletion");
}
});