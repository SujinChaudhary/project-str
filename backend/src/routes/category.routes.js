import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../libs/schemas/category.schema.js";
import categoryController from "../controllers/category.controllers.js";

const router = Router();

router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.get("/", categoryController.getAllCategories);

router.get("/:id", categoryController.getCategoryById);

router.put(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  categoryController.deleteCategory
);

export default router;
