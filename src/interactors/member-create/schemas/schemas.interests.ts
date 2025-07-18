import { z } from "zod";

/**
 * Schema for the interests section
 */
export const MemberCreateInterestsInfoSchema = z.object({
  interests: z.array(z.string()).default([]).describe("List of volunteer opportunity IDs the member is interested in"),
});

/**
 * TypeScript type for the interests section
 */
export type MemberCreateInterestsInfo = z.infer<typeof MemberCreateInterestsInfoSchema>;

export const MEMBER_CREATE_INTERESTS_INFO_FORM_FIELDS: (keyof MemberCreateInterestsInfo)[] = ["interests"];
