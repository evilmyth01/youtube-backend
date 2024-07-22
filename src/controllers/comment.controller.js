import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import Comment from "../models/comments.model.js"
import Video from "../models/video.model.js"
import mongoose from "mongoose"


const getVideoComments = asyncHandler(async(req,res)=>{
    const {page=1,limit=10} = req.query;

    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10),
    }

    const {videoId} = req.params;
    if(!videoId){
        throw new apiError(400,"Please provide video id");
    }

    const matchStage = { $match: { "video": new mongoose.Types.ObjectId(videoId) } };

const aggregate = Comment.aggregate([matchStage]);
const comments = await Comment.aggregatePaginate(aggregate, options);

    
    return res.status(200).json(new apiResponse(200,comments,"Comments retrieved successfully"));

})

const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {commentBody} = req.body;

    if(!videoId){
        throw new apiError(400,"Please provide video id");
    }
    if(!commentBody){
        throw new apiError(400,"Please provide comment content");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new apiError(404,"Video not found");
    }

    if(!req.user){
        throw new apiError(401,"You need to login to comment");
    }

    const comment = await Comment.create({
        content:commentBody,
        video:videoId,
        owner:req.user._id,
    });

    return res.status(200).json(new apiResponse(200,comment,"Comment added successfully"));

})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const {commentBody} = req.body;

    if(!commentId){
        throw new apiError(400,"Please provide comment id");
    }
    if(!commentBody){
        throw new apiError(400,"Please provide comment content");
    }

    let comment = await Comment.findById(commentId);
    if(!comment){
        throw new apiError(404,"Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"You are not allowed to update this comment");
    }

    const updatedComment = await Comment.findById(commentId);
    updatedComment.content = commentBody;
    await updatedComment.save();

    if(!updatedComment){
        throw new apiError(500,"Error updating comment");
    }

    return res.status(200).json(new apiResponse(200,comment,"Comment updated successfully"));
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;

    if(!commentId){
        throw new apiError(400,"Please provide comment id");
    }

    let comment = await Comment.findById(commentId);
    if(!comment){
        throw new apiError(404,"Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"You are not allowed to delete this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new apiError(500,"Error deleting comment");
    }

    return res.status(200).json(new apiResponse(200,deletedComment,"Comment deleted successfully"));
})

export{
    addComment,
    updateComment,
    deleteComment,
    getVideoComments,
}

