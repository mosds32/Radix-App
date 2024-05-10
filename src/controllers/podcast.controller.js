import {prisma}  from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const getPodcast = asyncHandler(async(req, res, next) =>
{
try
{
       const getPodcasts = await prisma.podcast.findMany();
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

export const addFavoritePodcast = asyncHandler(async(req, res, next) =>
{
    try
    {
        const {podcast_id} = req.body;
        const now = new Date(); 
      const addFavorite = await prisma.favoritepodcast.create(
        {
           data:
           {
            podcast_podcast_id:parseInt(podcast_id),
            user_user_id: req.user.user_id,
            favoritepodcast_createdat:now,
            favoritepodcast_modifiedat: now
           }
        }
      );
      if(addFavorite)
        {
            return res.status(200).json(new ApiResponse(200, "Favorite Added", addFavorite));
        }
    }
    catch(error)
    {
       throw new ApiError(403, error?.message || "Error in Favorite");
    }
});

