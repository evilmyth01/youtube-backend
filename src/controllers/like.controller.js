import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"
import Comment from "../models/comments.model.js"
import Like from "../models/like.model.js"
import Tweet from "../models/tweets.model.js"

const toggleVideoLike = asyncHandler(async (req,res,next)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new apiError(404,"Video not found")
    }
    const like = await Like.findOne({ 
        likedBy: req.user._id 
    });
    if(like){
        if(like.video.includes(videoId)){
            like.video = like.video.filter(id => id.toString() !== videoId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Unliked the video")
            )
        }
        else{
            like.video.push(videoId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Liked the video")
            )
        }
    }

    const likedVideo = await Like.create({likedBy:req.user._id,video:[videoId]});
    if(!likedVideo){
        return next(new apiError(400,"Could not like the video"));
    }
    return res.status(200).json(
        new apiResponse(200,likedVideo,"liked the video")
    );
})

const toggleCommentLike = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new apiError(404,"Comment not found")
    }
    const like = await Like.findOne({ 
        likedBy: req.user._id 
    });
    if(like){
        if(like.comment.includes(commentId)){
            like.comment = like.comment.filter(id => id.toString() !== commentId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Unliked the comment")
            )
        }
        else{
            like.comment.push(commentId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Liked the comment")
            )
        }
    }

    const likedComment = await Like.create({likedBy:req.user._id,comment:[commentId]});
    if(!likedComment){
        return next(new apiError(400,"Could not like the comment"));
    }
    return res.status(200).json(
        new apiResponse(200,likedComment,"liked the comment")
    );
})

const toggleTweetLike = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new apiError(404,"Tweet not found")
    }
    const like = await Like.findOne({ 
        likedBy: req.user._id 
    });
    if(like){
        if(like.tweet.includes(tweetId)){
            like.tweet = like.tweet.filter(id => id.toString() !== tweetId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Unliked the tweet")
            )
        }
        else{
            like.tweet.push(tweetId);
            await like.save();
            return res.status(200).json(
                new apiResponse(200, like, "Liked the tweet")
            )
        }
    }

    const likedTweet = await Like.create({likedBy:req.user._id,tweet:[tweetId]});
    if(!likedTweet){
        return next(new apiError(400,"Could not like the tweet"));
    }
    return res.status(200).json(
        new apiResponse(200,likedTweet,"liked the tweet")
    );
})

const getLikedVideos = asyncHandler(async (req,res)=>{
    if(!req.user){
        throw new apiError(401,"Unauthorized");
    }
    const likes = await Like.find({likedBy:req.user._id}).populate("video");
    if(!likes){
        throw new apiError(404,"No liked videos found");
    }
    return res.status(200).json(
        new apiResponse(200,likes,"Liked videos")
    )
})

const getTotalLikes = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new apiError(404,"Video not found")
    }
    const likes = await Like.find({ video: videoId })
    const totalLikes = likes.length;
    res.status(200).json(
        new apiResponse(200,totalLikes,"Total likes")
    
    )
})




export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getTotalLikes,

}


