import { ROLE_ADMIN, ROLE_CUSTOMER, ROLE_VENDOR } from "../constants/roles.js";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import { verifyAccessToken } from "../utils/jwt.js";

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Not authorized, no token"));
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Not authorized, user not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Not authorized, token failed"));
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role.includes(ROLE_ADMIN)) {
    next();
  } else {
    return res
      .status(403)
      .json(new ApiResponse(403, "Not authorized as admin"));
  }
};

const isVendor = (req, res, next) => {
  if (req.user && req.user.role.includes(ROLE_VENDOR)) {
    next();
  } else {
    return res
      .status(403)
      .json(new ApiResponse(403, "Not authorized as vendor"));
  }
};

const isCustomer = (req, res, next) => {
  if (req.user && req.user.role.includes(ROLE_CUSTOMER)) {
    next();
  } else {
    return res
      .status(403)
      .json(new ApiResponse(403, "Not authorized as customer"));
  }
};

export default {
  protect,
  isAdmin,
  isVendor,
  isCustomer,
};
