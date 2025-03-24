import { z } from "zod";

/**
 * Schema for the interests section
 */
export const MemberEditInterestsInfoSchema = z.object({
    interests: z.array(z.string()).default([])
        .describe(
            "List of volunteer opportunity IDs the member is interested in",
        ),
});

/**
 * TypeScript type for the interests section
 */
export type MemberEditInterestsInfo = z.infer<
    typeof MemberEditInterestsInfoSchema
>;

export const MEMBER_EDIT_INTERESTS_INFO_FORM_FIELDS:
    (keyof MemberEditInterestsInfo)[] = [
        "interests",
    ];