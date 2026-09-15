import { z } from "zod";
import { objectIdRegex } from "../../constants/regex.js";

const addCartItemSchema = z.object({
  productVariantId: z
    .string({ error: "Product variant ID is required." })
    .regex(objectIdRegex, { error: "Invalid product variant ID." }),
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be a whole number." })
    .min(1, { error: "Quantity must be at least 1." })
    .optional(),
});

const updateCartItemSchema = z.object({
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be a whole number." })
    .min(1, { error: "Quantity must be at least 1." }),
});

export { addCartItemSchema, updateCartItemSchema };
