import * as z from "zod";

const vendorStatisticsQuerySchema = z.object({
  period: z
    .enum(["today", "7days", "30days", "year"], {
      error: "Invalid period. Must be today, 7days, 30days, or year.",
    })
    .optional(),
});

export { vendorStatisticsQuerySchema };
