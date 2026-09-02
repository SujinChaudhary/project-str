import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  managedBy: z.string().trim().default(""),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  managedBy: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
