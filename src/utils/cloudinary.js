import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localPath) => {
    
    try {
        if(!localPath) return null;
      // Upload the image
      const response = await cloudinary.uploader.upload(localPath,{
        resource_type: "auto",
      });

      fs.unlinkSync(localPath)
      // console.log("response ",response);
      return response.url;

    } catch (error) {
        fs.unlinkSync(localPath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
};

export {
    uploadOnCloudinary,
}