import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import userController from "../controllers/user.controller.js";
import {
  updateProfileSchema,
  updateUserByAdminSchema,
} from "../libs/schemas/user.schema.js";

const router = Router();

// ===== Self-service routes — any authenticated user, own account only =====

router.get("/me", authMiddleware.protect, userController.getMyProfile);

router.put(
  "/me",
  authMiddleware.protect,
  validate(updateProfileSchema), // rejects attempts to include "role" in the body
  userController.updateMyProfile,
);

router.delete("/me", authMiddleware.protect, userController.deleteMyProfile);

// ===== Admin-managed routes — require protect + isAdmin =====

router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  userController.getAllUsers,
);

router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  validateObjectId(), // 400 on malformed id instead of a Mongoose CastError
  userController.getUserById,
);

router.put(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  validateObjectId(),
  validate(updateUserByAdminSchema), // allows role changes, not password
  userController.updateUserByAdmin,
);

router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  validateObjectId(),
  userController.deleteUserByAdmin,
);

export default router;
