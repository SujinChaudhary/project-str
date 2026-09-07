import mongoose from "mongoose";
import {
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_DISPATCHED,
    ORDER_STATUS_DELIVERED,
} from "../constants/orderStatuses.js";

const ITEM_STATUSES = [
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_DISPATCHED,
    ORDER_STATUS_DELIVERED,
];

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        shippingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShippingAddress",
            required: true,
        },

        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                price_at_purchase: {
                    type: Number,
                    required: true,
                },
                items_status: {
                    type: String,
                    default: ORDER_STATUS_PENDING,
                    enum: ITEM_STATUSES,
                },
            },
        ],

        status: {
            type: String,
            default: ORDER_STATUS_PENDING,
            enum: ITEM_STATUSES,
        },

        totalPrice: {
            type: Number,
            required: true,
        },
        
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
