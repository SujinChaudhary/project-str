import { z } from "zod";

import { objectIdRegex } from "../../constants/regex.js";

// Reusable ObjectID validator
const objectId = z
  .string({ required_error: "ID is required." })
  .regex(objectIdRegex, { message: "Invalid ID format." });

// Updated review schema
const createReviewSchema = z.object({
  product: objectId,
  order: objectId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export { createReviewSchema, updateReviewSchema };
