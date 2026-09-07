import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

// Middleware to validate that a given route parameter is a valid MongoDB ObjectId.
const validateObjectId =
  (paramName = "id") =>
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return next(new AppError("Invalid user id.", 400));
    }
    next();
  };

export default validateObjectId;
