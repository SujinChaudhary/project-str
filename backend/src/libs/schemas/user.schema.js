import { z } from "zod";
import {
  ROLE_ADMIN,
  ROLE_CUSTOMER,
  ROLE_VENDOR,
} from "../../constants/roles.js";
import {
  phoneRegex,
  emailRegex,
  passwordRegex,
} from "../../constants/regex.js";

//
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: z.email("Please provide a valid email").trim().optional(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Please provide a valid phone number")
      .optional(),
    password: z
      .string()
      .regex(passwordRegex, {
        error:
          "Password must container upper,lower,special symbol and must be greater than 6 character",
      })
      .optional(),
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .optional(),
  })
  .refine((data) => !data.password || !!data.currentPassword, {
    message: "Current password is required to set a new password.",
    path: ["currentPassword"],
  });

// Schema for an ADMIN updating another user's record.
// Allows changing role, but never password here — admins editing another
// user's password is a separate, more sensitive flow (not implemented).
export const updateUserByAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  email: z.email("Please provide a valid email").trim().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Please provide a valid phone number")
    .optional(),
  role: z.array(z.enum([ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER])).optional(),
});
