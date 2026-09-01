import { z } from "zod";
import { emailRegex, passwordRegex } from "../../constants/regex.js";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email:z.email({error:(email)=> email.input ? "Invalid email address" : "Email is required" }).trim().check(z.minLength(6),z.maxLength(100),z.regex(emailRegex)),

  password:z.string({error:"Password is required"}).trim().check(z.minLength(6),z.maxLength(100),z.regex(passwordRegex,{error:"Password must container upper,lower,special symbol and must be greater than 6 character"})),

  role: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email:z.email({error:(email)=> email.input ? "Invalid email address" : "Email is required" }).trim().check(z.minLength(6),z.maxLength(100),z.regex(emailRegex)),

  password:z.string({error:"Password is required"}).trim().check(z.minLength(6),z.maxLength(100),z.regex(passwordRegex,{error:"Password must container upper,lower,special symbol and must be greater than 6 character"})),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
