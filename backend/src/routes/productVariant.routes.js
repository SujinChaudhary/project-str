import express from 'express';
import productVariantControllers from '../controllers/productVariant.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { productVariantSchema } from '../libs/schemas/product.schema.js';

const router = express.Router();

router.post("/:id",authMiddleware.protect,authMiddleware.isVendor, validate(productVariantSchema), productVariantControllers.createVariant);

router.get("/:id",authMiddleware.protect,authMiddleware.isVendor, productVariantControllers.getVariantsByProduct);

router.put("/:id",authMiddleware.protect,authMiddleware.isVendor, validate(productVariantSchema), productVariantControllers.updateVariant);

router.delete("/:id",authMiddleware.protect,authMiddleware.isVendor, productVariantControllers.deleteVariant);

export default router;