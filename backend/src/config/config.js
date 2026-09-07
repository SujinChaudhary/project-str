import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 8000,
  host: process.env.HOST || "localhost",
  database_name: process.env.DATABASE_NAME || "shopzone",
  database_port: process.env.DATABASE_PORT || 27017,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "15m",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  cloudinary:{
    cloudinaryName:process.env.CLOUDINARY_CLOUD_NAME || " ",
    cloudinaryApiKey:process.env.CLOUDINARY_API_KEY || " ",
    cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET || " "
  },
  geminiApiKey:process.env.GEMINI_API_KEY || " "
}

export default config;
