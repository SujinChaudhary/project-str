import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as reviewService from "../services/review.services.js";

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, review, "Review created"));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.status(200).json(new ApiResponse(200, reviews));
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user._id,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, review, "Review updated"));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user._id, req.user.role);
  res.status(200).json(new ApiResponse(200, null, "Review deleted"));
});
