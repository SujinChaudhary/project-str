import expres from 'express';
import productControllers from '../controllers/product.controllers.js';
import authMiddleware from '../middlewares/authenticate.js'
import validate from '../middlewares/validate.js';
import { productSchema} from '../libs/schemas/product.schema.js';

const router = expres.Router();

// product routes
router.post("/",authMiddleware.protect,authMiddleware.isVendor,validate(productSchema),productControllers.createProduct);

router.get("/",productControllers.getAllProducts);

router.get("/:id",productControllers.getProductById);

router.get("/:id",authMiddleware.protect,authMiddleware.isVendor,productControllers.getProductsByVendor);

router.put("/:id",authMiddleware.protect,authMiddleware.isVendor,validate(productSchema),productControllers.updateProduct);

router.delete("/:id",authMiddleware.protect,authMiddleware.isVendor,productControllers.deleteProduct);


export default router