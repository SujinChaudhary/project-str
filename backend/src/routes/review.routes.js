import express from "express";
import authMiddleware from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../libs/schemas/review.schema.js";
import * as reviewController from "../controllers/review.controllers.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware.protect,
  validate(createReviewSchema),
  reviewController.createReview,
);

router.get(
  "/product/:productId",
  validateObjectId("productId"),
  reviewController.getProductReviews,
);

router.patch(
  "/:id",
  authMiddleware.protect,
  validateObjectId("id"),
  validate(updateReviewSchema),
  reviewController.updateReview,
);

router.delete(
  "/:id",
  authMiddleware.protect,
  validateObjectId("id"),
  reviewController.deleteReview,
);

export default router;
