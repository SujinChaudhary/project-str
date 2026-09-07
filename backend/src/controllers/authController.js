import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", result));
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return res.status(200).json(new ApiResponse(200, "Login successful", result));
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Token refreshed successfully", result));
});

export default {
  register,
  login,
  refreshToken,
};
