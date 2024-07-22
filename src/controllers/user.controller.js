import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


const registerUser = asyncHandler(async(req,res)=>{
    console.log("req.body ",req.body);
    const {fullName,userName,email,password}=req.body;
    if(!fullName || !userName || !email || !password){
        throw new apiError(400,"All fields are required")
    }

    console.log("req.files ",req.files);

    const existingUser = await User.findOne({$or:[{userName},{email}]});
    if(existingUser){
        throw new apiError(400,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log("avatarLocalPath ",avatarLocalPath);    
    console.log("coverImageLocalPath ",coverImageLocalPath);


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log("avatar ",avatar);
    console.log("coverImage ",coverImage);

    const user = await User.create({
        fullName,
        userName,
        email,
        password,
        avatar:avatar,
        coverImage:coverImage,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    return res.status(201).json(
        new apiResponse(201,createdUser,"User registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    const {userName,email,password} = req.body;
    // console.log("req.body ",req.body);
    if(!userName && !email){
        throw new apiError(400,"Username or email is required")
    }

    const user = await User.findOne({$or:[{userName},{email}]});
    if(!user){
        throw new apiError(400,"Invalid credentials or User not found")
    }

    const isPasswordCorrect = await user.isCorrectPassword(password);
    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid Password")
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    const loggedInUser = await User.findByIdAndUpdate(
        user._id,
        {
            refreshToken:refreshToken,
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:false,
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new apiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")
    )


})

const logoutUser = asyncHandler(async(req,res)=>{ 
    await User.findOneAndUpdate(  
        req.user._id,
        {
            $unset:{
                refreshToken:1,
            }
        },
        {
            new:true,
        }
    )

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new apiResponse(200,{},"User logged out successfully")
    )
})

const refreshRefreshToken = asyncHandler(async(req,res)=>{
    const token = req.cookies?.refreshToken || req.user.refreshToken;
    if(!token){
        throw new apiError(401,"Unauthorized access token from controllers")
    }

    const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user){
        throw new apiError(401,"Unauthorized access token from controllers")
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const loggedInUser = await User.findByIdAndUpdate(
        user._id,
        {
            refreshToken:refreshToken,
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{user:loggedInUser,accessToken,refreshToken},"refresh token generated successfully")
    )

})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new apiError(400,"All fields are required")
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(400,"User not found")
    }

    const isPasswordCorrect = await user.isCorrectPassword(oldPassword);
    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid Password")
    }

    // const updatedUser = await User.findByIdAndUpdate(
    //     user._id,
    //     {
    //         $set:{
    //             password:newPassword,
    //         }
    //     },
    //     {
    //         new:true,
    //     }
    // ).select("-password -refreshToken")

    const userDoc = await User.findById(user._id);
    userDoc.password = newPassword;
    await userDoc.save();

    return res.status(200).json(
        new apiResponse(200,userDoc,"Password updated successfully")
    )
})

const getCurrentUserAndHistory = asyncHandler(async(req,res)=>{
    if(!req.user){
        throw new apiError(400,"User not found")
    }

    const history = await Promise.all(req.user.watchHistory?.map(async(videoId)=>{
        videoId = videoId.toString();
        const video = await Video.findById(videoId).populate("owner");
        return video;
    }))

    

    return res.status(200).json(
        new apiResponse(200,{user:req.user,history},"User found successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body;

    if(!fullName || !email){
        throw new apiError(400,"All fields are required")
    }

    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if(!user){
        throw new apiError(400,"User not found")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email,
            }
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new apiResponse(200,updatedUser,"User updated successfully")
    )
})

const updateAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new apiError(500,"Avatar upload failed")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar,
            }
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new apiResponse(200,updatedUser,"Avatar updated successfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new apiError(400,"Avatar is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new apiError(500,"cover image upload failed")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage,
            }
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new apiResponse(200,updatedUser,"Cover Image updated successfully")
    )
})

const getUserById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!id){
        throw new apiError(400,"User id is required")
    }

    const user = await User.findById(id).select("-password -refreshToken");
    if(!user){
        throw new apiError(400,"User not found")
    }

    return res.status(200).json(
        new apiResponse(200,user,"User found successfully")
    )
})

export{
    registerUser,
    loginUser,
    logoutUser,
    refreshRefreshToken,
    changePassword,
    getCurrentUserAndHistory,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserById,
}