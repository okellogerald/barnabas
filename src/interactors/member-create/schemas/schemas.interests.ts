import { z } from "zod";

/**
 * Schema for the interests section
 */
export const InterestsSchema = z.object({
    interests: z.array(z.string()).default([])
        .describe(
            "List of volunteer opportunity IDs the member is interested in",
        ),
});

/**
 * TypeScript type for the interests section
 */
export type InterestsInfo = z.infer<typeof InterestsSchema>;

export type InterestInfo = string;

/**
 * Default values for the interests section
 */
export const DEFAULT_INTERESTS_INFO: InterestsInfo = {
    interests: [],
};
