import Order from "../models/Order.js";
import ShippingAddress from "../models/ShippingAddress.js";
import crypto from "crypto";

import {
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_CONFIRMED,
} from "../constants/orderStatuses.js";

import { ROLE_ADMIN } from "../constants/roles.js";
import { AppError } from "../utils/AppError.js";

const getAllOrders = async () => {
    const orders = await Order.find()
        .populate("user", "name email phone")
        .populate("shippingAddress")
        .populate("orderItems.product", "name brand category price imageUrls");

    if (!orders) {
        throw new AppError("Error fetching orders!", 404);
    }

    return orders;
};

const getOrderById = async (id, user) => {
    const order = await Order.findById(id)
        .populate("user", "name email phone")
        .populate("shippingAddress")
        .populate("orderItems.product", "name brand category price imageUrls");

    if (!order) {
        throw new AppError("Order not found!", 404);
    }

    if (order.user._id.toString() !== user._id.toString() && !user.role.includes(ROLE_ADMIN)) {
        throw new AppError("Access Denied!", 403);
    }

    return order;
};

const getAllOrdersByUser = async (userId) => {
    const orders = await Order.find({ user: userId })
        .populate("user", "name email phone")
        .populate("shippingAddress")
        .populate("orderItems.product", "name brand category price imageUrls");

    if (!orders) {
        throw new AppError("Error fetching orders!", 404);
    }

    return orders;
};

const createOrder = async (orderData, user) => {
    const orderNumber = crypto.randomUUID();

    // Validate shipping address belongs to the user
    const address = await ShippingAddress.findOne({
        _id: orderData.shippingAddress,
        user: user._id,
    });

    if (!address) {
        throw new AppError("Shipping address not found or does not belong to you!", 404);
    }

    const order = await Order.create({
        ...orderData,
        user: user._id,
        orderNumber,
        shippingAddress: address._id,
    });

    if (!order) {
        throw new AppError("Error creating order!", 500);
    }

    return order;
};

const cancelOrder = async (id, user) => {
    const order = await getOrderById(id, user);

    if (order.status !== ORDER_STATUS_PENDING) {
        throw new AppError("Order cannot be cancelled!", 400);
    }

    return await Order.findByIdAndUpdate(
        id,
        { status: ORDER_STATUS_CANCELLED },
        { returnDocument: "after" },
    );
};

const confirmOrder = async (id, user) => {
    const order = await getOrderById(id, user);

    if (order.status !== ORDER_STATUS_PENDING) {
        throw new AppError("Order cannot be confirmed!", 400);
    }

    // Payment Part...

    return await Order.findByIdAndUpdate(
        id,
        { status: ORDER_STATUS_CONFIRMED },
        { returnDocument: "after" },
    );
};

const updateOrderStatus = async (id, data) => {
    const order = await Order.findByIdAndUpdate(
        id,
        { status: data.status },
        { returnDocument: "after" },
    );

    if (!order) {
        throw new AppError("Error updating order!", 404);
    }

    return order;
};

const deleteOrder = async (id) => {
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
        throw new AppError("Error deleting order!", 404);
    }

    return { message: "Order deleted successfully." };
};

export default {
    getAllOrders,
    getOrderById,
    getAllOrdersByUser,
    createOrder,
    cancelOrder,
    confirmOrder,
    updateOrderStatus,
    deleteOrder,
};
