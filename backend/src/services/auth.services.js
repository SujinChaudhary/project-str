import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const register = async ({ name, email, password, phone }) => {
  // Check existing email
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already in use.", 409);
  }

  // Check existing phone number
  const existingPhone = await User.findOne({ phone });

  if (existingPhone) {
    throw new AppError("Phone number already in use.", 409);
  }

  const userData = {
    name,
    email,
    password,
    phone,
  };

  const user = await User.create(userData);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

const login = async ({ email, phone, password }) => {
  try {
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    }).select("+password");

    if (!user) {
      throw new AppError("Invalid email/phone or password.", 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email/phone or password.", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Login failed. Please try again.", 500);
  }
};

const refreshToken = async ({ refreshToken: token }) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User not found.", 401);
  }

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
  };
};

export default {
  register,
  login,
  refreshToken,
};
