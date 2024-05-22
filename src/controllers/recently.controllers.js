import {prisma} from '../client/client.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import redisClient from '../client/redis-client.js';
export const recently = asyncHandler(async (req, res, next) => {
    try {
        const { broadcast_id } = req.body;
        const now = new Date();
        // Create recent played entry in the database
        const recentBroad = await prisma.recentplayed.create({
            data: {
                broadcast_boradcast_id: parseInt(broadcast_id),
                user_user_id: req.user.user_id,
                recentplayed_createdat: now,
                recentplayed_modifiedat: now,
            }
        });

        if (recentBroad) {
            // Cache the newly created recent played data in Redis
            redisClient.setex(`recentPlayed:${req.user.user_id}`, 3600, JSON.stringify(recentBroad));

            return res.status(200).json(new ApiResponse(200, "Recently Played", recentBroad));
        }
    } catch (error) {
        // Handle errors
        throw new ApiError(403, error?.message || "Error in Recently Favorites");
    }
});
export const getRecentPlayed = asyncHandler(async (req, res, next) => {
    try {
        // Check if data is cached in Redis
        redisClient.get(`recentPlayed:${req.user.user_id}`, async (error, cachedData) => {
            if (error) {
                throw new ApiError(500, "Error in Redis");
            }

            if (cachedData) {
                // If cached data is found, return it
                return res.status(200).json(new ApiResponse(200, "Get Recently Played", JSON.parse(cachedData)));
            }

            // If no cached data found, fetch data from database
            const getRecentPlayed = await prisma.recentplayed.findMany({
                where: {
                    user_user_id: req.user.user_id
                }
            });

            if (getRecentPlayed) {
                // Cache the fetched data in Redis for 1 hour (3600 seconds)
                redisClient.setex(`recentPlayed:${req.user.user_id}`, 3600, JSON.stringify(getRecentPlayed));

                // Return the fetched data
                return res.status(200).json(new ApiResponse(200, "Get Recently Played", getRecentPlayed));
            }
        });
    } catch (error) {
        // Handle errors
        throw new ApiError(403, error?.message || "Error in Played");
    }
});