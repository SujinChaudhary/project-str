import mongoose from 'mongoose';
import config from './config.js';

const databaseConnection = async() =>{
  try {
    const uri = `mongodb://${config.host}:${config.database_port}/${config.database_name}`;
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("DATABASE_ERROR:",error);
  }
}

export default databaseConnection;