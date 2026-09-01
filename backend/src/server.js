import express from 'express';
import config from './config/config.js';
import databaseConnection from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/user.routes.js';
import logger from './middlewares/loggerMiddleware.js';

const app = express();

// database connection
databaseConnection();

// body-parser
app.use(express.json());
// logger middleware
app.use(logger);

// testing route
app.get("/",(req,res)=>{
  res.send("server running successfully!")
})

// all routes here
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// error handler
app.use(errorHandler);

app.listen(config.port,()=>{
  console.log(`Server running successfully on port ${config.port}`)
})
