import { z } from "zod";
import {
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DISPATCHED,
    ORDER_STATUS_DELIVERED,
} from "../../constants/orderStatuses.js";

const orderStatusSchema = z.object({
    status: z.enum([
        ORDER_STATUS_PENDING,
        ORDER_STATUS_CANCELLED,
        ORDER_STATUS_CONFIRMED,
        ORDER_STATUS_DISPATCHED,
        ORDER_STATUS_DELIVERED,
    ]),
});

const orderItemSchema = z.object({
    product: z.string(),
    quantity: z.number().min(1).optional(),
    price_at_purchase: z.number().min(0, "Price at purchase is required"),
});

const orderSchema = z.object({
    orderItems: z.array(orderItemSchema).min(1),
    totalPrice: z.number(),
    shippingAddress: z.string({ error: "Shipping address ID is required" }),
});

export { orderSchema, orderStatusSchema };
