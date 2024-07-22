import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import Playlist from "../models/playlist.model.js"


const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    if(!name){
        throw new apiError(400,"Name is required")
    }

    const owner = req.user._id;

    const playlist = await Playlist.create({
        name,
        description,
        owner,
    })

    if(!playlist){
        throw new apiError(400,"Playlist could not be created")
    }

    return res.status(201).json(
        new apiResponse(201,playlist,"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!userId){
        throw new apiError(400,"User Id is required")
    }

    const playlists = await Playlist.find({owner:userId}).populate("videos owner");

    return res.status(200).json(
        new apiResponse(200,playlists,"User playlists retrieved successfully")
    )
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;    
    if(!playlistId){
        throw new apiError(400,"Playlist Id is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(400,"Playlist not found")
    }

    const playlistVideos = await Playlist.findById(playlist._id).populate("videos")

    return res.status(200).json(
        new apiResponse(200,playlistVideos,"Playlist retrieved successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{

    //check the response of this api if this is sending the playlist with videos or without it.

    const {playlistId} = req.params;
    if(!playlistId){
        throw new apiError(400,"Playlist Id is required")
    }

    const {videoId} = req.body;
    if(!videoId){
        throw new apiError(400,"Video Id is required")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new apiError(400,"Playlist not found")
    }

    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new apiError(403,"You are not authorized to add video to this playlist")
    }

    playlist.videos.push(videoId);

    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new apiError(400,"Video could not be added to playlist")
    }

    return res.status(200).json(
        new apiResponse(200,updatedPlaylist,"Video added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{

    //check the response of this api if this is sending the playlist with videos or without it.

    const {playlistId} = req.params;
    const {videoId} = req.body;
    if(!playlistId || !videoId){
        throw new apiError(400,"Playlist Id and Video Id are required")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new apiError(400,"Playlist not found")
    }

    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new apiError(403,"You are not authorized to remove video from this playlist")
    }

    playlist.videos = playlist.videos.filter(v=>v.toString() !== videoId);

    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new apiError(400,"Video could not be removed from playlist")
    }

    return res.status(200).json(
        new apiResponse(200,updatedPlaylist,"Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    if(!playlistId){
        throw new apiError(400,"Playlist Id is required")
    }

    const playlist = await Playlist.findById(playlistId);
    
    if(!playlist){
        throw new apiError(400,"Playlist not found")
    }

    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new apiError(403,"You are not authorized to delete this playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if(!deletedPlaylist){
        throw new apiError(400,"error in deleting playlist")
    }
    

    return res.status(200).json(
        new apiResponse(200,deletedPlaylist,"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {name,description} = req.body;

    if(!playlistId){
        throw new apiError(400,"Playlist Id is required")
    }
    if(!name){
        throw new apiError(400,"Name is required")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new apiError(400,"Playlist not found")
    }

    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new apiError(403,"You are not authorized to update this playlist")
    }

    playlist.name = name;
    if(description){
        playlist.description = description;
    }

    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new apiError(400,"Playlist could not be updated")
    }

    return res.status(200).json(
        new apiResponse(200,updatedPlaylist,"Playlist updated successfully")
    )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
}