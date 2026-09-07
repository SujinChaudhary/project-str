import { z } from "zod";
import {
  emailRegex,
  passwordRegex,
  phoneRegex,
} from "../../constants/regex.js";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .email({
      error: (email) =>
        email.input ? "Invalid email address" : "Email is required",
    })
    .trim()
    .check(z.minLength(6), z.maxLength(100), z.regex(emailRegex)),

  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .check(
      z.length(10, "Phone number must be exactly 10 digits"),
      z.regex(phoneRegex, {
        error: "Phone number must contain only digits",
      }),
    ),
  password: z
    .string({ error: "Password is required" })
    .trim()
    .check(
      z.minLength(6),
      z.maxLength(100),
      z.regex(passwordRegex, {
        error:
          "Password must container upper,lower,special symbol and must be greater than 6 character",
      }),
    ),
});
//Email and phone are optional, but at least one of them must be provided
export const loginSchema = z
  .object({
    email: z
      .email({
        error: (email) =>
          email.input ? "Invalid email address" : "Email is required",
      })
      .trim()
      .check(z.minLength(6), z.maxLength(100), z.regex(emailRegex))
      .optional(),

    phone: z
      .string({ error: "Phone number is required" })
      .trim()
      .check(
        z.length(10, "Phone number must be exactly 10 digits"),
        z.regex(phoneRegex, {
          error: "Phone number must contain only digits",
        }),
      )
      .optional(),

    password: z
      .string({ error: "Password is required" })
      .trim()
      .check(
        z.minLength(6),
        z.maxLength(100),
        z.regex(passwordRegex, {
          error:
            "Password must container upper,lower,special symbol and must be greater than 6 character",
        }),
      ),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
    path: ["email"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
