import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { ORDER_STATUS_DELIVERED } from "../constants/orderStatuses.js";

export async function createReview(userId, data) {
  // Verify the user actually purchased AND received this product
  // before allowing a review — checks order ownership, that the
  // product was actually in that order, and that it's completed.
  const order = await Order.findOne({
    _id: data.order,
    user: userId,
    "orderItems.product": data.product,
    status: ORDER_STATUS_DELIVERED,
  });

  if (!order) {
    throw new AppError(
      "You can only review products from completed orders",
      403,
    );
  }

  const existing = await Review.findOne({
    user: userId,
    product: data.product,
  });

  if (existing) {
    throw new AppError("You've already reviewed this product", 409);
  }

  return Review.create({ ...data, user: userId });
}

export async function getProductReviews(productId) {
  return Review.find({ product: productId }).populate("user", "name");
}

export async function updateReview(reviewId, userId, data) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  if (review.user.toString() !== userId.toString()) {
    throw new AppError("Not authorized to edit this review", 403);
  }

  Object.assign(review, data);
  await review.save();
  return review;
}

export async function deleteReview(reviewId, userId, userRoles) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  const isOwner = review.user.toString() === userId.toString();
  const isAdmin = userRoles.includes("ADMIN");

  if (!isOwner && !isAdmin) {
    throw new AppError("Not authorized to delete this review", 403);
  }

  await review.deleteOne();
}
