import { Router } from "express";
import authController from "../controllers/authController.js";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../libs/schemas/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken
);

export default router;
