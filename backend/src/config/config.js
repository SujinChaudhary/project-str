import dotenv from 'dotenv';

dotenv.config();

const config = {
  port:process.env.PORT || 8000,
  MONGODB_URI:process.env.MONGODB_URI || " ",
}

export default config;