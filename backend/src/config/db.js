import mongoose from 'mongoose';
import config from './config.js';

const databaseConnection = async() =>{
  try {
    console.log(config)
    await mongoose.connect(config.MONGODB_URI)
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("DATABASE_ERROR:",error);
  }
}

export default databaseConnection;