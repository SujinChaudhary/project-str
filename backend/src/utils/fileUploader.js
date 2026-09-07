import { v2 as cloudinary } from 'cloudinary'

const uploadFiles = async(files) =>{
  const uploadedFiles = [];
  for(const file of files){
    const result = await new Promise((resolve,reject)=>{
    cloudinary.uploader.upload_stream({folder: "shopzone",
    allowed_formats: ["jpg", "png", "mp4", "webp"],
    },(error,data)=>{
      if(error){
        reject(error)
      }
      resolve(data)
  }).end(file.buffer);
  })
  uploadedFiles.push(result);
  }
  return uploadedFiles;
}
export default uploadFiles;