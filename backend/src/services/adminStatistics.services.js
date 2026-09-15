import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DISPATCHED,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_CANCELLED,
} from "../constants/orderStatuses.js";
import { ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER } from "../constants/roles.js";

const getDateFilter = (period) => {
    if (!period) return null;

    const now = new Date();
    let startDate;

    switch (period) {
        case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "7days":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "30days":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            return null;
    }

    return startDate;
};

const getAdminStatistics = async (query) => {
    const dateFilter = getDateFilter(query?.period);

    const orderMatch = {};
    if (dateFilter) {
        orderMatch.createdAt = { $gte: dateFilter };
    }

    // Run all independent top-level queries in parallel
    const [
        totalUsers,
        totalCustomers,
        totalVendors,
        totalAdmins,
        totalProducts,
        activeProducts,
        inactiveProducts,
        orderStatsResult,
        topProducts,
        topVendors,
        recentOrders,
        recentUsers,
    ] = await Promise.all([

        User.countDocuments(),
        User.countDocuments({ role: ROLE_CUSTOMER }),
        User.countDocuments({ role: ROLE_VENDOR }),
        User.countDocuments({ role: ROLE_ADMIN }),

        Product.countDocuments(),
        Product.countDocuments({ status: "ACTIVE" }),
        Product.countDocuments({ status: "INACTIVE" }),

        Order.aggregate([
            { $match: orderMatch },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" },
                    totalItemsSold: { $sum: { $sum: "$orderItems.quantity" } },
                },
            },
        ]),

        // --- Top 5 products by quantity sold ---
        Order.aggregate([
            { $match: orderMatch },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$orderItems.quantity", "$orderItems.price_at_purchase"],
                        },
                    },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 1,
                    name: "$product.name",
                    totalSold: 1,
                    totalRevenue: 1,
                },
            },
        ]),

        // --- Top 5 vendors by revenue ---
        Order.aggregate([
            { $match: orderMatch },
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "productInfo",
                },
            },
            { $unwind: "$productInfo" },
            {
                $group: {
                    _id: "$productInfo.vendorId",
                    totalOrders: { $addToSet: "$_id" },
                    totalItemsSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$orderItems.quantity", "$orderItems.price_at_purchase"],
                        },
                    },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "vendor",
                    pipeline: [{ $project: { name: 1, email: 1 } }],
                },
            },
            { $unwind: "$vendor" },
            {
                $project: {
                    _id: 1,
                    name: "$vendor.name",
                    email: "$vendor.email",
                    totalOrders: { $size: "$totalOrders" },
                    totalItemsSold: 1,
                    totalRevenue: 1,
                },
            },
        ]),

        // --- Recent 5 orders ---
        Order.aggregate([
            { $match: orderMatch },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "customer",
                    pipeline: [{ $project: { name: 1, email: 1 } }],
                },
            },
            { $unwind: "$customer" },
            {
                $project: {
                    _id: 1,
                    orderNumber: 1,
                    status: 1,
                    totalPrice: 1,
                    createdAt: 1,
                    customer: 1,
                },
            },
        ]),

        // --- Recent 5 users ---
        User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("_id name email role createdAt")
            .lean(),
    ]);

    //Order status breakdown from a separate aggregation
    const orderStats = orderStatsResult[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
    };

    const statusCounts = await Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const ordersByStatus = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    };

    statusCounts.forEach((item) => {
        switch (item._id) {
            case ORDER_STATUS_PENDING:
                ordersByStatus.pending = item.count;
                break;
            case ORDER_STATUS_CONFIRMED:
                ordersByStatus.processing = item.count;
                break;
            case ORDER_STATUS_DISPATCHED:
                ordersByStatus.shipped = item.count;
                break;
            case ORDER_STATUS_DELIVERED:
                ordersByStatus.delivered = item.count;
                break;
            case ORDER_STATUS_CANCELLED:
                ordersByStatus.cancelled = item.count;
                break;
        }
    });

    return {
        users: {
            total: totalUsers,
            customers: totalCustomers,
            vendors: totalVendors,
            admins: totalAdmins,
        },
        products: {
            total: totalProducts,
            active: activeProducts,
            inactive: inactiveProducts,
        },
        orders: {
            total: orderStats.totalOrders,
            totalItemsSold: orderStats.totalItemsSold,
            totalRevenue: orderStats.totalRevenue,
            ...ordersByStatus,
        },
        topProducts,
        topVendors,
        recentOrders,
        recentUsers,
    };
};

export default { getAdminStatistics };
