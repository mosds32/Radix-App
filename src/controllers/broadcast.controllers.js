import {prisma}  from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const getBroadCastCategory = asyncHandler(async(req, res, next) =>
{
try
{
    const type = req.params.type;
const getBroadCastCategory = await prisma.categorybroad.findMany(
    {
        where:
        {
            categorybroad_type:type
        }
    }
);
if(getBroadCastCategory)
    {
        return res.status(200).json(new ApiResponse(200, "Get Category", getBroadCastCategory));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message ||  "Error in Category BroadCast Category" );
}

} );
export const getBroadCast = asyncHandler(async(req, res, next) =>
{
    try
    {
const getBroad = await prisma.broadcast.findMany();
if(getBroad)
    {
        return res.status(200).json(new ApiResponse(200, "Get Broad", getBroad));
    }


    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "Error in BroadCast");
    }
} );
export const favoriteBroadCast = asyncHandler(async(req, res, next) =>
{
try
{
const {broadcast_id} = req.body;
const now = new Date();
const favorites = await prisma.favoritestation.create(
    {
        data:
        {
            broadcast_boradcast_id: parseInt(broadcast_id),
            user_user_id: req.user.user_id,
            favoritestation_createdat: now,
            favoritestation_modifiedat: now
        }
    }
);
if(favorites)
    {
        return res.status(200).json(new ApiResponse(200, "Favorites ", favorites));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Favorites");
}

}); 