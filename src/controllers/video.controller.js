import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import Video from "../models/video.model.js"


const getAllVideo = asyncHandler(async(req,res)=>{
    const {page=1,limit=16} = req.query;

    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10),
    }

    const videos = await Video.aggregatePaginate({},options);
    await Video.populate(videos.docs, { path: 'owner' });

    return res.status(200).json(
        new apiResponse(200,videos,"Videos retrieved successfully")
    )
})

const publishAVideo = asyncHandler(async(req,res)=>{
    const {title,description,duration} = req.body;
    // console.log("title ",title);
    // console.log("description ",description);
    // console.log("duration ",duration);
    // console.log("req ",req);

    if(!title || !description || !duration){
        throw new apiError(400,"All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new apiError(500,"Error uploading video")
    }

    if(!thumbnail){
        throw new apiError(500,"Error uploading thumbnail")
    }

    if(!req.user){
        throw new apiError(401,"Unauthorized access")
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile,
        thumbnail,
        owner:req.user._id,
    })

    if(!video){
        throw new apiError(500,"Error publishing video")
    }

    return res.status(201).json(
        new apiResponse(201,video,"Video published successfully")
    )

})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new apiError(400,"Video ID is required")
    }

    const video = await Video.findById(videoId).populate("owner","fullName userName avatar");

    if(!video){
        throw new apiError(404,"Video not found")
    }

    return res.status(200).json(
        new apiResponse(200,video,"Video retrieved successfully")
    )
})


const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!videoId){
        throw new apiError(400,"videoId is required");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if(!video){
        throw new apiError(404,"Video not found");
    }

    return res.status(200).json(
        new apiResponse(200,video,"Video deleted successfully")
    )
})


const updateVideo = asyncHandler(async(req,res)=>{

    const {videoId} = req.params;
    if(!videoId){
        throw new apiError(400,"videoId is required");
    }

    const {title,description,duration} = req.body;
    if(!title || !description || !duration){
        throw new apiError(400,"All fields are required")
    }

   const thumbnail = req.file?.path;
   const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

   if(!uploadedThumbnail){
       throw new apiError(500,"Error uploading thumbnail")
   }

   const video = await Video.findByIdAndUpdate(
         videoId,
         {
              $set:{
                title,
                description,
                duration,
                thumbnail:uploadedThumbnail,
              }
         },
         {
              new:true,
         }
    
   )

    if(!video){
         throw new apiError(500,"Error updating video")
    }

    return res.status(200).json(
        new apiResponse(200,video,"Video updated successfully")
    )

})


const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new apiError(400,"videoId is required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new apiError(404,"Video not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!video.isPublished,
            }
        },
        {
            new:true,
        }
    )

    if(!updatedVideo){
        throw new apiError(500,"Error updating video")
    }

    return res.status(200).json(
        new apiResponse(200,updatedVideo,"Video updated successfully")
    )

})

const getVideosByUserId = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!userId){
        throw new apiError(400,"userId is required")
    }

    const user = await User.findById(userId);
    if(!user){
        throw new apiError(404,"User not found")
    }

    const videos = await Video.find({owner:userId})

    return res.status(200).json(
        new apiResponse(200,videos,"Videos retrieved successfully")
    )
})

const updateViewsAndHistory = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new apiError(400,"videoId is required")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new apiError(404,"Video not found")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                views:video.views+1,
            }
        },
        {
            new:true,
        }
    )

    const updatedUser = await User.findById(req.user._id);
    if(!updatedUser){
        throw new apiError(404,"User not found")
    }

    if(!updatedUser.watchHistory.includes(videoId)){
        updatedUser.watchHistory.push(videoId);
        await updatedUser.save();
    }


    if(!updatedVideo){
        throw new apiError(500,"Error updating video")
    }



    return res.status(200).json(
        new apiResponse(200,updatedVideo,"Video updated successfully")
    )
})


export{
    getAllVideo,
    publishAVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    togglePublishStatus,
    getVideosByUserId,
    updateViewsAndHistory,
}