import express from "express";
import cartController from "../controllers/cart.controllers.js";
import authMiddleware from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../libs/schemas/cart.schema.js";

const router = express.Router();

router.get("/", authMiddleware.protect, cartController.getCart);

router.post(
  "/",
  authMiddleware.protect,
  validate(addCartItemSchema),
  cartController.addItem
);

router.put(
  "/:cartId",
  authMiddleware.protect,
  validateObjectId("cartId"),
  validate(updateCartItemSchema),
  cartController.updateCartItem
);

router.delete(
  "/:cartId",
  authMiddleware.protect,
  validateObjectId("cartId"),
  cartController.removeCartItem
);

router.delete("/", authMiddleware.protect, cartController.clearCart);

export default router;
