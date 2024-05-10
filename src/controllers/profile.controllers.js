import {prisma}  from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

import { asyncHandler
 } from '../utils/AsyncHandler.js';

export const addProfile = asyncHandler(async(req, res, next) =>
{
    try
    {
       const {name, email, location } = req.body;
       const img = "/uploads/" + req.file.filename;
       const now = new Date();
       const createProfile = await prisma.profile.create(
        {
            data:
            {
                profile_name:name,
                profile_email:email,
                profile_location: location, 
                profile_img: img,
                profile_createdat: now, 
                profile_modifiedat: now,
                user_user_id: req.user.user_id
            }
        }
       );
       if(createProfile)
        {
            return res.status(200).json(new ApiResponse(200, "Profile Created", createProfile))
        }

    }
catch(error)
{
throw new ApiError(403, error?.message || "Error in Profile" );
}
});
export const getProfile = asyncHandler(async(req, res, next) =>
{
try
{
const getProfile = await prisma.profile.findMany(
    {
        where:
        {
            user_user_id: req.user_id
        }
    }
);
if(getProfile)
    {
        return res.status(200).json(new ApiResponse(200, "Get Info", getProfile));
    }


}
catch(error)
{
    throw new ApiError(403, error?.message  || "Error in Get Profile");
}


});
export const EditProfile = asyncHandler(async(req, res, next) =>
{
    try
    {
const {name, email, location} = req.body;
const img = "/uploads/" + req.file.filename;
const now = new Date();
const userId = req.user.user_id;
const userprofile = await prisma.profile.findFirst(
    {
        where:
        {
            user_user_id: userId
        }
    }
);
if(!userprofile)
    {
        return res.status(200).json(new ApiResponse(200, "Profile Not Exist"));
    }

const updateProfile = await prisma.profile.update(
    {
        where:
        {
            profile_id: userprofile.profile_id
        },
        data:
        {
            profile_name: name,
            profile_email: email,
            profile_location: location,
            profile_img: img,
            profile_createdat: now,
            profile_modifiedat: now,
            user_user_id: req.user.user_id
        }
    }
);
if(updateProfile)
    {
        return res.status(200).json(new ApiResponse(200, "Update Profile", updateProfile));
    }
    }
catch(error)
{
 throw new ApiError(403, error?.message || "Error in Editing Profile");
}
});

