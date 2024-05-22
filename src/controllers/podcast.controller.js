import {prisma}  from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const getPodcast = asyncHandler(async(req, res, next) =>
{
try
{
    const type = req.params.type;
    const findCategory = await prisma.category.findMany(
        {
            where:
            {
                category_type: type
            }
        }
    );
    const findId = await findCategory.map(getId => getId.category_id);

       const getPodcasts = await prisma.podcast.findMany(
        {
            where:
            {
                category_categorybroad_id: parseInt(findId)
            }
        }
       );
       if(getPodcasts)
        {
return res.status(200).json(new ApiResponse(200, "Get Podcast", getPodcasts));
        }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in PodCasts" );

}
});
