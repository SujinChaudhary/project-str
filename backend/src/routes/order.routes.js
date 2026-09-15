import express from "express";
import orderControllers from "../controllers/order.controllers.js";
import authenticate from "../middlewares/authenticate.js";
import validate  from "../middlewares/validate.js";
import { orderSchema, orderStatusSchema } from "../libs/schemas/order.schema.js";

const router = express.Router();

router.get("/", authenticate.protect, authenticate.isAdmin, orderControllers.getAllOrders);

router.post("/", authenticate.protect, authenticate.isCustomer, validate(orderSchema), orderControllers.createOrder);

router.get("/users", authenticate.protect, authenticate.isCustomer ,orderControllers.getAllOrdersByUser);

router.get("/:id", authenticate.protect, orderControllers.getOrderById);

router.patch("/:id/cancel", authenticate.protect, orderControllers.cancelOrder);

router.patch("/:id/confirm", authenticate.protect, orderControllers.confirmOrder);

router.put("/:id/status", authenticate.protect, authenticate.isAdmin, validate(orderStatusSchema), orderControllers.updateOrderStatus);

router.delete("/:id", authenticate.protect, authenticate.isAdmin, orderControllers.deleteOrder);

export default router;