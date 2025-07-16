import { z } from "zod";
import dayjs from "dayjs";
import { TZ_PHONE_NUMBER_PATTERN } from "@/constants/patterns";

/**
 * Transforms a date field to an ISO string
 */
export const dateTransformer = (date: Date | dayjs.Dayjs) =>
  dayjs(date).format("YYYY-MM-DD");

// Create a custom Zod type for Dayjs
const dayjsSchema = z.custom<dayjs.Dayjs>(
  (val) => {
    return dayjs.isDayjs(val);
  },
  {
    message: "Must be a valid dayjs object",
  }
);

/**
 * Common error response schema for 400 Bad Request errors
 * This is reused across all contracts to ensure consistent error handling
 */
const badRequestErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string()), z.record(z.string())]),
  error: z.string(),
});

/**
 * Utility function to create a paginated response schema
 * @param itemSchema The schema for individual items in the response
 * @returns A schema for a paginated response containing items of the specified type
 */
function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    total: z.number().positive(),
  });
}

/**
 * Schema for UUID id
 */
const idSchema = z.string().uuid();

const dateSchema = z
  .union([
    z.string().datetime(), // 2025-03-12T10:46:05.000Z
    z.date(), // new Date()
    z.string().date(), // 2025-03-12
    dayjsSchema, // dayjs()
  ])
  .transform((e) => {
    const valid = dayjs(e).isValid();
    if (valid) return dayjs(e).toDate();
    throw "Invalid date";
  });

/**
 * Common timestamp fields that are present in most entities
 */
const timestampFields = {
  createdAt: dateSchema,
  updatedAt: dateSchema,
};

const phoneNumberSchema = z
  .string()
  .regex(TZ_PHONE_NUMBER_PATTERN, "Invalid phone number format")
  .min(10, "Phone number must be at least 10 digits")
  .transform((val) => {
    // Normalize to always start with "255"
    if (val.startsWith("+255")) return val.replace("+", "");
    if (val.startsWith("0")) return "255" + val.slice(1);
    return val; // Already starts with "255", the requirement by the backend team
  })
  .describe("Phone number");

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters");

export const CommonSchemas = {
  id: idSchema,
  badRequestError: badRequestErrorSchema,
  systemDates: timestampFields,
  dayjs: dayjsSchema,
  createPaginatedResponseSchema,
  date: dateSchema,
  previousDate: dateSchema.refine(
    (date) => !date || date <= new Date(),
    "Date can't be in the future"
  ),
  phoneNumber: phoneNumberSchema,
  name: nameSchema,
};

export type BadRequestError = z.infer<typeof badRequestErrorSchema>;
// export type BarnabasDate = z.infer<typeof dateSchema>;
