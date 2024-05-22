import {prisma} from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const addFavorite = asyncHandler(async(req, res, next) => 
{
try
{
const {favorite_category, favorite_parent, favorite_child} = req.body;
const now = new Date();
const favorite_create = await prisma.favorite.create(
    {
      data:
      {
        favorite_category: favorite_category,
        favorite_parent: parseInt(favorite_parent),
        favorite_child: parseInt(favorite_child),
        user_user_id: req.user.user_id,
        favorite_createdat: now,
        favorite_modifiedat: now
      }
    }
);
if(favorite_create)
    {
        return res.status(200).json(new ApiResponse(200, "Favorite Added", favorite_create));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Favorites");
}
});
export const getFavorites = asyncHandler(async(req, res, next) =>
{
    try
    {
const {type} = req.params;
const getallFavorites = await prisma.favorite.findMany(
    {
        where:
        {
            user_user_id: req.user.user_id,
            favorite_category: type,
            
        },
        orderBy:
        {
            favorite_createdat: 'desc'
        }
    }
);
let allfavorite = [];

if(type==='broadCast')
    {
        allfavorite = await Promise.allSettled(getallFavorites.map(async item => 
            {
                const track = await prisma.broadcast.findFirst(
                    {
                        where:
                        {
                            boradcast_id: item.favorite_parent
                        }
                    }
                );
                return track;
            }
        ))
    }
 if(type==='podcast')
    {
       allfavorite = await Promise.allSettled(getallFavorites.map(async item =>
        {
            const track = await prisma.podcast.findFirst(
                {
                    where:
                    {
                        podcast_id: item.favorite_parent
                    }
                }
            );
            return track;
        }
       ));
    }
if(type==='event')
{
     allfavorite = await Promise.allSettled(getallFavorites.map(async item =>
        {
            const track = await prisma.event.findFirst(
                {
                    where:
                    {
                        event_id: item.favorite_parent
                    }
                }
            );
            return track;
        }
     ));
}
allfavorite = allfavorite.map(item =>item.value).filter(item => item !== null);
if(getallFavorites.length < 0)
    {
        return res.status(404).json(new ApiResponse(404, "Get All Favorites: Record not found"));
    }
return res.status(200).json(new ApiResponse(200, "Get Favorites Records", {
    type,
    favoriteData: allfavorite
}))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "Error in Favorite");
    }

});