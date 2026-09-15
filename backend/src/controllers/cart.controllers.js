import cartService from "../services/cart.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);

  res.status(200).json(new ApiResponse(200, "Cart fetched successfully.", cart));
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);

  res.status(201).json(new ApiResponse(201, "Item added to cart.", cart));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(req.user._id, req.params.cartId, req.body);

  res.status(200).json(new ApiResponse(200, "Cart item updated successfully.", cart));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCartItem(req.user._id, req.params.cartId);

  res.status(200).json(new ApiResponse(200, "Item removed from cart.", cart));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);

  res.status(200).json(new ApiResponse(200, "Cart cleared successfully.", cart));
});

export default { getCart, addItem, updateCartItem, removeCartItem, clearCart };
