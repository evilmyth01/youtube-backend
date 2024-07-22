import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js"
import Subscription from "../models/subscription.model.js"
import Video from "../models/video.model.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
    
    const {channelId} = req.params;
    if(!channelId){
        throw new apiError(400,"Channel Id is required")
    }


    const subscriber = req.user._id.toString();

    if(!subscriber){
        throw new apiError(400,"User not found")
    }

    if(subscriber === channelId){
        throw new apiError(400,"You cannot subscribe to your own channel")
    }

    const channel = await Subscription.findOne({subscriber,channel:channelId});
    if(channel){
        const response=await Subscription.findByIdAndDelete(channel._id);
        return res.status(200).json(
            new apiResponse(200,{response},`Unsubscribed from channel successfully`)
        )
    }

    else{
        const newSubscription = await Subscription.create({subscriber,channel:channelId});
        newSubscription.save();

        return res.status(200).json(
            new apiResponse(200,{newSubscription},`Subscribed to channel successfully`)
        )
    }
})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    if(!channelId){
        throw new apiError(400,"Channel Id is required")
    }

    const subscribersCount = await Subscription.find({channel:channelId}).countDocuments();

    const allSubscribers = await Subscription.find({channel:channelId}).populate("subscriber");

    return res.status(200).json(
        new apiResponse(200,{subscribersCount,allSubscribers},"Subscribers fetched successfully")
    )

})

const getSubscribedChannels= asyncHandler(async(req,res)=>{
    const subscriber = req.user._id;
    if(!subscriber){
        throw new apiError(400,"User not found")
    }

    const subscribedChannels = await Subscription.find({subscriber});
    if(!subscribedChannels){
        throw new apiError(400,"No subscribed channel found")
    }

    const channelsDetails = await Promise.all(subscribedChannels.map(async(channel)=>{
        const channelDetails = await User.findById(channel.channel);
        return channelDetails
    }))

    return res.status(200).json(
        new apiResponse(200,{subscribedChannels,channelsDetails},"Subscribed channels fetched successfully")
    )
})




export{
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,

}