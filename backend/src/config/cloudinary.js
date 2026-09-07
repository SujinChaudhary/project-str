import { v2 as cloudinary } from 'cloudinary';
import config from './config.js';
const connectCloudinary = () =>{
 
  cloudinary.config({
    cloud_name:config.cloudinary.cloudinaryName,
    api_key:config.cloudinary.cloudinaryApiKey,
    api_secret:config.cloudinary.cloudinaryApiSecret
  })
  console.log("Cloudinary connected successfully!")
}

export default connectCloudinary;