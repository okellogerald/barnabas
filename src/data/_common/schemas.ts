import { z } from "zod";

/**
 * Common error response schema for 400 Bad Request errors
 * This is reused across all contracts to ensure consistent error handling
 */
export const badRequestErrorSchema = z.object({
    statusCode: z.number(),
    message: z.union([
        z.string(),
        z.array(z.string()),
        z.record(z.string()),
    ]),
    error: z.string(),
});

export type BadRequestError = z.infer<typeof badRequestErrorSchema>;

/**
 * Common pagination schema for list responses
 */
export const paginationSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Utility function to create a paginated response schema
 * @param itemSchema The schema for individual items in the response
 * @returns A schema for a paginated response containing items of the specified type
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
    itemSchema: T,
) {
    return z.object({
        data: z.array(itemSchema),
        pagination: paginationSchema,
    });
}

/**
 * Common timestamp fields that are present in most entities
 */
export const timestampFields = {
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
};

/**
 * Schema for UUID id
 */
export const idSchema = z.string().uuid();

/**
 * Enumeration values for various fields
 */
export const enums = {
    gender: z.enum(["Male", "Female"]),
    maritalStatus: z.enum(["Single", "Married", "Separated", "Divorced"]),
    marriageType: z.enum(["Christian", "Non-Christian"]),
    educationLevel: z.enum([
        "Informal",
        "Primary",
        "Secondary",
        "Certificate",
        "Diploma",
        "Bachelors",
        "Masters",
        "Doctorate",
        "Other",
    ]),
    memberRole: z.enum(["Clergy", "Staff", "Regular", "Leader", "Volunteer"]),
    dependantRelationship: z.enum([
        "Child",
        "House Helper",
        "Relative",
        "Parent",
        "Sibling",
        "Grandchild",
        "Grandparent",
        "Niece/Nephew",
        "Guardian",
        "Ward",
        "Spouse",
        "In-Law",
        "Extended Family",
        "Other",
    ]),
};
