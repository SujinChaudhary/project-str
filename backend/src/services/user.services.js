import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

// Get logged-in user's own profile
const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

// Get all users - Admin only
const getAllUsers = async () => {
  const users = await User.find().select("-password");

  return users;
};

// Get a single user by ID - Admin only
const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

// Update logged-in user's own profile
const updateProfile = async (userId, updates) => {
  // Check duplicate email
  if (updates.email) {
    const existingEmail = await User.findOne({
      email: updates.email,
      _id: { $ne: userId },
    });

    if (existingEmail) {
      throw new AppError("Email already in use.", 409);
    }
  }

  // Check duplicate phone
  if (updates.phone) {
    const existingPhone = await User.findOne({
      phone: updates.phone,
      _id: { $ne: userId },
    });

    if (existingPhone) {
      throw new AppError("Phone number already in use.", 409);
    }
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  Object.assign(user, updates);

  // .save() triggers password hashing if password was changed
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

// Admin updating another user's profile
const updateUserByAdmin = async (id, updates) => {
  // Check duplicate email
  if (updates.email) {
    const existingEmail = await User.findOne({
      email: updates.email,
      _id: { $ne: id },
    });

    if (existingEmail) {
      throw new AppError("Email already in use.", 409);
    }
  }

  // Check duplicate phone
  if (updates.phone) {
    const existingPhone = await User.findOne({
      phone: updates.phone,
      _id: { $ne: id },
    });

    if (existingPhone) {
      throw new AppError("Phone number already in use.", 409);
    }
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

// Delete user
const deleteUserById = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }
};

export default {
  getMyProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserByAdmin,
  deleteUserById,
};
