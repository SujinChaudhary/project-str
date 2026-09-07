import * as z from "zod";
import { objectIdRegex } from '../../constants/regex.js';

const objectId = z.string({ error: "ID is required." }).regex(objectIdRegex, { error: "Invalid ID." }).optional();

const productSchema = z.object({
  vendorId: objectId,
  categoryId: objectId,

  name: z
    .string({ error: "Product name is required." })
    .check(z.minLength(3, { error: "Name too small" }), z.maxLength(100, { error: "Name too long" }))
    .trim(),

  description: z.string().trim().optional(),

  isFeatured: z.boolean().optional(),

  status: z.enum(["ACTIVE", "INACTIVE"], { error: "Invalid status." }).optional(),
});

const productVariantSchema = z.object({
  productId: objectId,

  size: z.array(z.string().trim()).optional(),

  color: z.array(z.string().trim()).optional(),

  brand: z
    .string({ error: "Product brand is required." })
    .trim(),

  price: z
  .coerce.number({ error: (data) => (!data.input ? "Price is required." : "Price must be a number.") })
  .check(z.gte(1, { error: "Price must be greater than 0." }), z.lte(9999999, { error: "Price too high." })),

  stock: z.coerce.number().optional(),

  imageUrls: z.array(z.string().trim()).optional(),
});

export {
  productSchema,
  productVariantSchema,
};