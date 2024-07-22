import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import Video from "../models/video.model.js"
import Subscription from "../models/subscription.model.js"
import Like from "../models/like.model.js"


const getChannelStats = asyncHandler(async(req,res)=>{
    const allVideos = await Video.find({owner:req.user._id});

    let totalViews = 0;
    totalViews = allVideos.reduce((acc,video)=>acc+video.views,0);


    const allSubscriptions = await Subscription.find({channel:req.user._id});
    const totalSubscribers = allSubscriptions.length;

    const likedVideos = await Promise.all(allVideos.map(async (video) => {
        return await Like.find({ video: video._id }).populate('likedBy');
    }));

    const allLikes = likedVideos.flat();
    const totalLikes = allLikes.length;

    return res.status(200).json(new apiResponse(200,{
        totalViews,
        totalSubscribers,
        totalLikes,
    },"Channel stats fetched successfully"));


})

const getChannelVideos = asyncHandler(async(req,res)=>{
    const allVideos = await Video.find({owner:req.user._id});
    if(!allVideos){
        throw new apiError(404,"No videos found for this channel");
    }
    return res.status(200).json(new apiResponse("Channel videos fetched successfully",allVideos));
})


export{
    getChannelStats,
    getChannelVideos,

}


