import express from "express";
import adminStatisticsControllers from "../controllers/adminStatistics.controllers.js";
import authMiddleware from "../middlewares/authenticate.js";
import { adminStatisticsQuerySchema } from "../libs/schemas/adminStatistics.schema.js";
import validate from '../middlewares/validate.js';

const router = express.Router();

router.get(
    "/",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    validate(adminStatisticsQuerySchema,"query"),
    adminStatisticsControllers.getStatistics
);

export default router;
