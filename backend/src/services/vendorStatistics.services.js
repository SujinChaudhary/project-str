import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DISPATCHED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
} from "../constants/orderStatuses.js";

const STATUS_KEY_MAP = {
  [ORDER_STATUS_PENDING]: "pending",
  [ORDER_STATUS_CONFIRMED]: "processing",
  [ORDER_STATUS_DISPATCHED]: "shipped",
  [ORDER_STATUS_DELIVERED]: "delivered",
  [ORDER_STATUS_CANCELLED]: "cancelled",
};

const EMPTY_STATS = {
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  totalItemsSold: 0,
  orders: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
  topProducts: [],
  recentOrders: [],
};

const getDateFilter = (period) => {
  const now = new Date();

  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "30days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
};

const buildOrdersByStatus = (statusCounts) => {
  const result = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };

  statusCounts.forEach(({ _id, count }) => {
    const key = STATUS_KEY_MAP[_id];
    if (key) result[key] = count;
  });

  return result;
};

const getVendorStatistics = async (vendorId, query) => {
  const [totalProducts, vendorProductIds] = await Promise.all([
    Product.countDocuments({ vendorId }),
    Product.find({ vendorId }).distinct("_id"),
  ]);

  if (vendorProductIds.length === 0) {
    return EMPTY_STATS;
  }

  const dateFilter = getDateFilter(query?.period);

  const orderMatch = {
    "orderItems.product": { $in: vendorProductIds },
    ...(dateFilter && { createdAt: { $gte: dateFilter } }),
  };

  const [result] = await Order.aggregate([
    { $unwind: "$orderItems" },
    { $match: orderMatch },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              orderIds: { $addToSet: "$_id" },
              totalRevenue: {
                $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price_at_purchase"] },
              },
              totalItemsSold: { $sum: "$orderItems.quantity" },
            },
          },
        ],
        topProducts: [
          {
            $group: {
              _id: "$orderItems.product",
              totalSold: { $sum: "$orderItems.quantity" },
              totalRevenue: {
                $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price_at_purchase"] },
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
        ],
      },
    },
  ]);

  const summary = result.summary[0] || { orderIds: [], totalRevenue: 0, totalItemsSold: 0 };
  const { orderIds, totalRevenue, totalItemsSold } = summary;

  if (orderIds.length === 0) {
    return { ...EMPTY_STATS, totalProducts };
  }

  const [statusCounts, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { _id: { $in: orderIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { _id: { $in: orderIds } } },
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
  ]);

  return {
    totalProducts,
    totalOrders: orderIds.length,
    totalRevenue,
    totalItemsSold,
    orders: buildOrdersByStatus(statusCounts),
    topProducts: result.topProducts,
    recentOrders,
  };
};

export default { getVendorStatistics };