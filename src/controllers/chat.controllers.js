import {prisma} from '../client/client.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import _ from 'lodash';
import pkg from 'lodash';
const {now} = pkg;
export const addPost = asyncHandler(async(req, res, next) =>
{
    try
    {
const {user_text} = req.body;
const now = new Date();
const currentPost = await prisma.chatpost.create(
    {
        data:
        {
            user_user_id: req.user.user_id,
            chatpost_text: user_text,
            chatpost_createdat: now
        }
    }
);
await Promise.allSettled(req.files?.map(async item =>
    {
         if(item)
            {
                let ChatFile = await prisma.chatfile.create(
                    {
                        data:
                        {
                            chatfile_filename: "/uploads/" + item.filename,
                            user_user_id: req.user.user_id,
                            chatpost_chatpost_id: currentPost.chatpost_id,
                            chatfile_createdat: now
                        }
                    }
                );
                return ChatFile;
            }
    }
));
if(!currentPost)
    {
        return res.status(401).json(new ApiResponse(401, "Add Post Failed"));
    }
return res.status(200).json(new ApiResponse(200, "Post Added"));
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "Error in Post");
    }

});

export const addLikeComment = asyncHandler(async(req, res, next) =>
{
try
{
    const {user_id} = req.user;
const {user_like, user_comment, chat_id} = req.body;
const value = req.body; 
const now = new Date();
if(user_like)
    {
        return await likeChatPost(res, value, user_id);
    }
const currentPost = await prisma.chatdetail.create(
    {
        data:
        {
            user_user_id: user_id,
            chatdetail_comment: user_comment,
            chatpost_chatpost_id: parseInt(chat_id),
            chatdetail_createdat: now
        }
    }
);
if(!currentPost)
    {
        return res.status(401).json(new ApiResponse(401, "Add Commit Failed"));
    }
return res.status(200).json(new ApiResponse(200, "Current Posts", currentPost));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Like Comment");
}
} );
const likeChatPost = async(res, value, userId) =>
    {
        try
        {
            const now = new Date();
           const currentPostDetail = await prisma.chatdetail.findFirst(
            {
                where:
                {
                    user_user_id: userId,
                    chatpost_chatpost_id: parseInt(value.chat_id),
                    chatdetail_comment:
                    {
                        equals: null
                    }
                },
                orderBy:
                {
                    chatdetail_createdat:'desc'
                }
            }
           );
           let like = false;
           if(parseInt(value.user_like) === 1 && !currentPostDetail?.chatdetail_like)
            {
                like=true
            }
             
            const currentPost = await prisma.chatdetail.upsert(
                {
                    create:
                    {
                        user_user_id: userId,
                        chatdetail_like: like | null,
                        chatpost_chatpost_id: parseInt(value.chat_id),
                        chatdetail_createdat: now
                    },
                    update:
                    {
                        chatdetail_like: like | null,
                        chatdetail_modifiedat: now
                    },
                    where:
                    {
                        chatdetail_id: currentPostDetail?.chatdetail_id || 0,
                        user_user_id: userId,
                        chatpost_chatpost_id: parseInt(value.chat_id)
                    }
                }
            );
            if(!currentPost)
                {
                    return res.status(401).json(new ApiResponse(401, "Add Like Comment Failed"));
                }
return res.status(200).json(new ApiResponse(200, "Add Like Comment", currentPost ));
        }
        catch(error)
        {
            throw new ApiError(403, error?.message || "Error in Like Post");
        }
    };
export const getComments = asyncHandler(async(req, res, next) =>
{
try
{
    const {user_id} = req.user;
    const {chat_id} = req.params;
    const currentPosts = await prisma.chatdetail.findMany(
        {
            where:
            {
                user_user_id: user_id,
                chatpost_chatpost_id: parseInt(chat_id),
                chatdetail_comment:
                {
                    not:
                    {
                        equals: null
                    }
                }
            }
        }
    );
    if(!currentPosts)
        {
return res.status(401).json(new ApiResponse(401, "Get Comments Failed"));
        }
return res.status(200).json(new ApiResponse(200, "Get Comments : Success", currentPosts));


}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Comments");
}


});

export const getAllPost = asyncHandler(async(req, res, next) =>
{
try
{
const {current, max}=req.params;
let currentNum = current;
if(!currentNum)
    {
        currentNum = 0;
    }
  if(currentNum > max)
    {
       return res.status(401).json(new ApiResponse(401, "Get All Post: Index Bound Error"));
    }
const allChatPosts = await prisma.chatpost.findMany(
    {
        orderBy:
        {
            chatpost_createdat: 'desc'
        },
        where:
        {
            chatpost_deletedat:
            {
                equals:null
            }
        }
    }
);
let AllPostsWithDetails = await Promise.allSettled(allChatPosts.map(async item =>
    {
        const chatFile = await prisma.chatdetail.findMany(
            {
                where:
{
    user_user_id: item.user_user_id,
    chatpost_chatpost_id: item.chatpost_id
} });

const likes = await prisma.chatdetail.count(
    {
        where:
        {
            chatdetail_like:
            {
                not:
                {
                    equals: null
                }
            },
            chatpost_chatpost_id: item.chatpost_id,
        },
        orderBy:
        {
            chatdetail_createdat: 'desc'
        }
    }
);
const comments = await prisma.chatdetail.count(
    {
        where:
        {
            chatdetail_comment:
            {
                not:
                {
                    equals: null
                }
            },
            chatpost_chatpost_id: item.chatpost_id
        },
        orderBy:
        {
            chatdetail_modifiedat:"desc"
        }
    }
);
return {chatpost: item,
     chatFile: chatFile || null,
     like: likes || 0,
     comments:comments
}
}))
if(AllPostsWithDetails.length < 0 )
    {
        return res.status(404).json(new ApiResponse(404, "Get All Post Not Post Found"));
    }
AllPostsWithDetails = AllPostsWithDetails.map(item => item.value);
const AllPostsWithDetailsChunks = _.chunk(AllPostsWithDetails, 50);
const totalChunks =  AllPostsWithDetailsChunks.length;
return  res.status(200).json(new ApiResponse(200, "Get All Post: Post Found",
    {
        Posts: AllPostsWithDetailsChunks[currentNum] || [],
        MaxChunkIndex: totalChunks - 1,
    }
));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Get Post");
}

});

export const addSavePost = asyncHandler(async(req, res, next) =>
{
try
{
 const {user_id}  = req.user;
const {chatId} = req.params;
const now = new Date();
const currentPost = await prisma.chatsave.create(
    {
        data:
        {
            user_user_id: user_id,
            chatpost_chatpost_id: parseInt(chatId),
            chatsave_is_save:1,
            chatsave_createdat: now

        }
    }
);
if(!currentPost)
    {
        return res.status(401).json(new ApiResponse(401, "Add Save Post Failed"));
    }
return res.status(200).json(new ApiResponse(200,"Add Save Post ", currentPost));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Add Save Post");
}


});
export const getSavePost = asyncHandler(async(req, res, next) =>
{
try
{
const {user_id} = req.user;
const currentPosts = await prisma.chatsave.findMany(
    {
        where:
        {
            user_user_id: user_id,
            chatsave_is_save:1
        }
    }
);
if(!currentPosts)
    {
        return res.status(401).json(new ApiResponse(401, "Get Save Post Failed"));
    }
    return res.status(200).json(new ApiResponse(200, "Get Save Post", currentPosts));


}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Save Post");
}

});
export const updatePost = asyncHandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const {fileId} = req.params;
        const { user_text, chat_id,  } = req.body;
        const now = new Date();

        // Find the chatpost to update
        const chatpost = await prisma.chatpost.findFirst({
            where: {
                chatpost_id: chat_id,
                user_user_id: user_id,
            },
        });

        // If chatpost is not found, return 404
        if (!chatpost) {
            return res
                .status(404)
                .json(new ApiResponse(404, "Update Post! Record not Found"));
        }

        // Update the chatpost text and modification timestamp
        const currentPost = await prisma.chatpost.update({
            where: {
                chatpost_id: chatpost.chatpost_id,
                user_user_id: user_id,
            },
            data: {
                chatpost_text: user_text,
                chatpost_modfiedat: now, // Fixed typo in chatpost_modifiedat
            },
        });
       

         const chatfileFinder = await prisma.chatfile.findFirst(
            {
                where:
                {
                    user_user_id: user_id,
                    chatfile_id:parseInt(fileId)
                }
            }
         )
        // Update the associated chatfiles (if any)
    await Promise.allSettled(req.files?.map(async item =>
        {
            if(item)
                {
                    await prisma.chatfile.update(
                        {
                            data:
                            {
                                chatfile_filename: "/uploads/" + item.filename,
                                user_user_id: user_id,
                                chatpost_chatpost_id: chatpost.chatpost_id,
                                chatfile_createdat: now
                            },
                            where:
                            {
                              chatfile_id: chatfileFinder.chatfile_id
                            }
                        }
                    )
                }
        }
    ))

        // Check if the chatpost update was successful
        if (!currentPost) {
            return res
                .status(401)
                .json(new ApiResponse(401, "Current Post Update Failed"));
        }

        // Return success response
        return res.status(200).json(new ApiResponse(200, "Post Updated", currentPost));
    } catch (error) {
        throw new ApiError(403, error?.message || "Error in Posts");
    }
});
export const DeletePost = asyncHandler(async(req, res, next)  =>
{
try
{
const {user_id} = req.user;
const {chat_id} = req.params;
const now = new Date();
const chatpost = await prisma.chatpost.findFirst(
    {
        where:
        {
            chatpost_id: parseInt(chat_id),
            user_user_id: user_id
        }
    }
);
if(!chatpost)
    {
return res.status(404).json(new ApiResponse(404, "Record not Found"));
    }
const currentChatPost = await prisma.chatpost.update(
    {
        data:
        {
            chatpost_deletedat: now
        },
        where:
        {
            chatpost_id: chatpost.chatpost_id
        }
    }
);

if(currentChatPost.chatpost_deletedat===null)
    {
        return res.status(401).json(new ApiResponse(401, "Deleted Posted "));

    }
return res.status(200).json(new ApiResponse(200, "Deleted Success", currentChatPost));

}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Deleted")
}
});

export const DeleteComment = asyncHandler(async(req, res, next) =>
{
try
{
const {user_id} = req.user;
const {chatDetailId} = req.params;
const now = new Date();
const currentPosts = await prisma.chatdetail.update(
    {
        where:
        {
            user_user_id:user_id,
            chatdetail_id: parseInt(chatDetailId),
            chatdetail_comment:
            {
                not:
                {
                    equals:null
                }
            }
        },
        data:
        {
            chatdetail_deletedat: now
        }
    }
);
if(currentPosts)
    {
        return res.status(200).json(new ApiResponse(200, "Deleted Comment", currentPosts));
    }
}
catch(error)
{
    throw new ApiError(403, error?.message || "Error in Deleted Comment");
}


});

export const DeleteSavePost = asyncHandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const { chatId } = req.params;

        // Find the chatSave record
        const chatSave = await prisma.chatsave.findFirst({
            where: {
                chatpost_chatpost_id: parseInt(chatId),
                user_user_id: user_id,
                chatsave_is_save: 1,
            },
        });

        if (!chatSave) {
            return res.status(401).json(new ApiResponse(401, "Chat Save not Found"));
        }

        // Update the chatSave record to mark it as not saved
        const updatedChatSave = await prisma.chatsave.update({
            where: {
                chatsave_id: chatSave.chatsave_id,
            },
            data: {
                chatsave_is_save: 0,
            },
        });

        if (!updatedChatSave) {
            return res.status(401).json(new ApiResponse(401, "Current Post Not Deleted", updatedChatSave));
        }

        return res.status(200).json(new ApiResponse(200, "Post Deleted", updatedChatSave));
    } catch (error) {
        throw new ApiError(403, error?.message || "Error in Deleted Saved Post");
    }
});
