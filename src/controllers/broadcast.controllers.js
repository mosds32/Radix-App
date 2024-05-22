import {prisma}  from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

export const getBroadCast = asyncHandler(async(req, res, next) =>
{
    try
    {
        const type = req.params.type;
const getCategory = await prisma.category.findMany(
    {
        where: 
        {
            category_type:type
        }
    }
);
const getId = await getCategory.map(getId =>getId.category_id);

const getBroad = await prisma.broadcast.findMany(
    {
        where:
        {
                  category_categorybroad_id:parseInt(getId)
        }
    }
);
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
