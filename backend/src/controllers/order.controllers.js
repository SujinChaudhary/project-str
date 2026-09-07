import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import orderServices from "../services/order.services.js";

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderServices.getAllOrders();

    res.status(200).json(new ApiResponse(200, "Order fetched successfully.", orders));
});

const getOrderById = asyncHandler(async (req, res) => {
    const orders = await orderServices.getOrderById(req.params.id, req.user);

    res.status(200).json(new ApiResponse(200, "Order fetched successfully.", orders));
});

const getAllOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await orderServices.getAllOrdersByUser(req.user._id);

    res.status(200).json(new ApiResponse(200, "Order fetched successfully.", orders));
});

const createOrder = asyncHandler(async (req, res) => {
    const orderData = await orderServices.createOrder(req.body, req.user);

    res.status(200).json(new ApiResponse(200, "Order created successfully.", orderData));
});

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderServices.cancelOrder(req.params.id, req.user);

    res.status(200).json(new ApiResponse(200, "Order cancelled successfully.", order));
});


const confirmOrder = asyncHandler(async (req, res) => {
    const order = await orderServices.confirmOrder(req.params.id, req.user);

    res.status(200).json(new ApiResponse(200, "Order confirmed successfully.", order));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order =await orderServices.updateOrderStatus(req.params.id, req.body);

    res.status(200).json(new ApiResponse(200, "Order status updated successfully.", order));
});

const deleteOrder = asyncHandler(async (req, res) => {
    const order = await orderServices.deleteOrder(req.params.id);

    res.status(200).json(new ApiResponse(200, "Order deleted successfully.", order));
});

export default {
    getAllOrders, 
    getOrderById, 
    getAllOrdersByUser,
    createOrder, 
    cancelOrder,
    confirmOrder,
    updateOrderStatus, 
    deleteOrder
};