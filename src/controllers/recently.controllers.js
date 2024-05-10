import {prisma} from '../client/client.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const recently = asyncHandler(async(req, res, next) =>
{
try
{
 const {broadcast_id} = req.body;
 const now = new Date();
 const recentBroad = await prisma.recentplayed.create(
    {
        data:
        {
            broadcast_boradcast_id: parseInt(broadcast_id),
            user_user_id: req.user.user_id,
            recentplayed_createdat: now,
            recentplayed_modifiedat: now,
        }
    }
 );
 if(recentBroad)
    {
        return res.status(200).json(new ApiResponse(200, "Recently Played", recentBroad));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Recently Favorites");
}
});