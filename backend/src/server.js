import express from 'express';
import config from './config/config.js';
import databaseConnection from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import multer from 'multer';

// middlewares import
import errorHandler from './middlewares/errorHandler.js';
import logger from './middlewares/loggerMiddleware.js';

// routes import 
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import productVariantRoutes from './routes/productVariant.routes.js';

// Register models so Mongoose resolves populate() references at startup
import "./models/User.js";
import "./models/Product.js";
import "./models/ShippingAddress.js";

const app = express();

const upload = multer({storage:multer.memoryStorage(),limits:{fileSize:5000000}}) // 5mb

// database connection
databaseConnection();
// cloudinary connection
connectCloudinary();

// body-parser
app.use(express.json());
// logger middleware
app.use(logger);

// testing route
app.get("/", (req, res) => {
  res.send("server running successfully!");
});

// all routes here
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product-variant",upload.array("images",5),productVariantRoutes);

// error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running successfully on port ${config.port}`);
});
