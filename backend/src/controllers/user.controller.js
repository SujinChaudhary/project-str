import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/user/me
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", user));
});

// PUT /api/user/me
// If req.body.password is present, currentPassword must also be present —
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", user));
});

// DELETE /api/user/me
const deleteMyProfile = asyncHandler(async (req, res) => {
  await userService.deleteUserById(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Account deleted successfully", null));
});

// ===== Admin-managed (an ADMIN acting on any user's account) =====

// GET /api/user/
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();

  return res
    .status(200)
    .json(new ApiResponse(200, "Users retrieved successfully", users));
});

// GET /api/user/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", user));
});

// PUT /api/user/:id
//(role allowed, password not).
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await userService.updateUserByAdmin(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", user));
});

// DELETE /api/user/:id
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  await userService.deleteUserById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully", null));
});

export default {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
};
