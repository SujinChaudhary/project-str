import express from "express";
import authenticate from "../middlewares/authenticate.js";
import shippingAddressControllers from "../controllers/shippingAddress.controllers.js";
import validate from "../middlewares/validate.js";
import { createShippingAddressSchema, updateShippingAddressSchema } from "../libs/schemas/shippingAddress.schema.js";

const router = express.Router();

router.post("/", authenticate.protect, authenticate.isCustomer,validate(createShippingAddressSchema), shippingAddressControllers.addAddress);

router.get("/", authenticate.protect, authenticate.isCustomer, shippingAddressControllers.getMyAddresses);

router.get("/:id", authenticate.protect, authenticate.isCustomer, shippingAddressControllers.getAddressById);

router.put("/:id", authenticate.protect, authenticate.isCustomer, validate(updateShippingAddressSchema),shippingAddressControllers.updateAddress);

router.delete("/:id", authenticate.protect, authenticate.isCustomer, shippingAddressControllers.deleteAddress);

export default router;
