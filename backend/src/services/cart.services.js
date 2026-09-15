import Cart from "../models/Cart.js";
import ProductVariant from "../models/ProductVariant.js";
import { AppError } from "../utils/AppError.js";

const getCart = async (userId) => {
  const cart = await Cart.find({ user: userId }).populate(
    "productVariant",
    "productId size color brand price stock imageUrls"
  );

  return cart;
};

const addItem = async (userId, { productVariantId, quantity = 1 }) => {
  const variant = await ProductVariant.findById(productVariantId);

  if (!variant) {
    throw new AppError("Product variant not found.", 404);
  }

  if (variant.stock < quantity) {
    throw new AppError("Insufficient stock.", 400);
  }

  const existing = await Cart.findOne({
    user: userId,
    productVariant: productVariantId,
  });

  if (existing) {
    const newQuantity = existing.quantity + quantity;

    if (newQuantity > variant.stock) {
      throw new AppError("Insufficient stock.", 400);
    }

    existing.quantity = newQuantity;
    await existing.save();

    return await existing.populate(
      "productVariant",
      "productId size color brand price stock imageUrls"
    );
  }

  const cart = await Cart.create({
    user: userId,
    productVariant: productVariantId,
    quantity,
  });

  return await cart.populate(
    "productVariant",
    "productId size color brand price stock imageUrls"
  );
};

const updateCartItem = async (userId, cartId, { quantity }) => {
  const cart = await Cart.findOne({ _id: cartId, user: userId });

  if (!cart) {
    throw new AppError("Cart item not found.", 404);
  }

  const variant = await ProductVariant.findById(cart.productVariant);

  if (!variant) {
    throw new AppError("Product variant not found.", 404);
  }

  if (quantity > variant.stock) {
    throw new AppError("Insufficient stock.", 400);
  }

  cart.quantity = quantity;
  await cart.save();

  return await cart.populate(
    "productVariant",
    "productId size color brand price stock imageUrls"
  );
};

const removeCartItem = async (userId, cartId) => {
  const cart = await Cart.findOneAndDelete({ _id: cartId, user: userId });

  if (!cart) {
    throw new AppError("Cart item not found.", 404);
  }

  return cart;
};

const clearCart = async (userId) => {
  const result = await Cart.deleteMany({ user: userId });

  if (result.deletedCount === 0) {
    throw new AppError("Cart is already empty.", 404);
  }

  return { message: "Cart cleared successfully." };
};

export default { getCart, addItem, updateCartItem, removeCartItem, clearCart };
