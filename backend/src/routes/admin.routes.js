import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.js";
import userController from "../controllers/user.controllers.js";

const router = Router();

router.get(
  "/users",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  userController.getAllUsers
);

export default router;
