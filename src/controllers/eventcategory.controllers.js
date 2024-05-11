import {prisma} from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
export const getCategoryEvent = asyncHandler(async(req, res, next) =>
{
try
{
const type = req.params.type;

const getCategoryEvent = await prisma.categoryevent.findMany(
    {
        where:
        {
            categoryevent_title:type
        }
    }
);
if(getCategoryEvent)
    {
        return res.status(200).json(new ApiResponse(200, "Get Category Event", getCategoryEvent));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message ||  "Error in Category Event" );
}

});
export const getEvents = asyncHandler(async(req, res, next) =>
{
try
{
    const getEvent = await prisma.event.findMany();
    if(getEvent)
        {
            return res.status(200).json(new ApiResponse(200, "Get Event", getEvent));
        }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Event");
}
});

export const UserEvents = asyncHandler(async(req, res, next) =>
{
try
{
const {event_id} = req.body;
const now = new Date();
const events = await prisma.userevents.create(
    {
        data:
        {
            event_event_id: parseInt(event_id),
            user_user_id: req.user.user_id,
            userevents_createdat: now,
            userevents_modifiedat:now
        }
    }
);
if(events)
    {
        return res.status(200).json(new ApiResponse(200, "User Event", events));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Events");
}

});
export const getUserEvents = asyncHandler(async(req, res, next)  =>
{
try
{
const FindUser = await prisma.userevents.findMany(
    {
        where:
        {
           user_user_id: req.user.user_id 
        }
    }
);
if(FindUser)
    {
        return res.status(200).json(new ApiResponse(200, "Get Events", FindUser));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Getting Events");
}


} )

