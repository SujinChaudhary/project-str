import { z } from "zod";
import { objectIdRegex, phoneRegex } from "../../constants/regex.js";

// Base fields shared by create/update
const baseShippingAddress = {
  user: z
    .string()
    .regex(objectIdRegex, "Invalid user ID"),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number")
    .optional(),
  streetAddress: z
    .string()
    .trim()
    .min(1, "Street address is required"),
  city: z
    .string()
    .trim()
    .min(1, "City is required"),
  state: z
    .string()
    .trim()
    .optional(),
  postalCode: z
    .string()
    .trim()
    .optional(),
};

// CREATE — all required fields must be present
export const createShippingAddressSchema = z.object(baseShippingAddress);

// UPDATE — everything optional, but at least one field must be sent
export const updateShippingAddressSchema = z
  .object({
    fullName: baseShippingAddress.fullName.optional(),
    phoneNumber: baseShippingAddress.phoneNumber,
    streetAddress: baseShippingAddress.streetAddress.optional(),
    city: baseShippingAddress.city.optional(),
    state: baseShippingAddress.state,
    postalCode: baseShippingAddress.postalCode,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });