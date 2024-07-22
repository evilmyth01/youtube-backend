import apiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import Tweet from "../models/tweets.model.js";
import User from "../models/user.model.js";


const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new apiError(400,"Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id,
    })

    if(!tweet){
        throw new apiError(500,"Error creating tweet")
    }

    return res.status(201).json(
        new apiResponse(201,tweet,"Tweet created successfully")
    )
})


const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!userId){
        throw new apiError(400,"User ID is required")
    }

    const user = await User.findById(userId);
    if(!user){
        throw new apiError(404,"User not found")
    }

    const tweets = await Tweet.find({owner:userId});
    return res.status(200).json(
        new apiResponse(200,tweets,"User tweets retrieved successfully")
    )
})

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new apiError(400,"Tweet ID is required")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new apiError(404,"Tweet not found")
    }

    const {content} = req.body;
    if(!content){
        throw new apiError(400,"Content is required")
    }

    tweet.content = content;

    await tweet.save();

    return res.status(200).json(
        new apiResponse(200,tweet,"Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new apiError(400,"Tweet ID is required")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new apiError(404,"Tweet not found")
    }

    const tweetAfterDelete = await Tweet.findByIdAndDelete(tweetId);
    if(!tweetAfterDelete){
        throw new apiError(500,"Error deleting tweet")
    }

    return res.status(200).json(
        new apiResponse(200,tweetAfterDelete,"Tweet deleted successfully")
    )
})


export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}
