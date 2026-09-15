import express from "express";
import vendorStatisticsControllers from "../controllers/vendorStatistics.controllers.js";
import authMiddleware from "../middlewares/authenticate.js";
import validate from '../middlewares/validate.js';
import { vendorStatisticsQuerySchema } from "../libs/schemas/vendorStatistics.schema.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.isVendor,
  validate(vendorStatisticsQuerySchema,"query"),
  vendorStatisticsControllers.getStatistics
);

export default router;
