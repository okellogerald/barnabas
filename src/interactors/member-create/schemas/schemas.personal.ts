import { z } from "zod";
import { Gender } from "@/constants";

/**
 * Schema for personal information
 */
export const PersonalInfoSchema = z.object({
    envelopeNumber: z.string().optional().describe(
        "Unique envelope number assigned to the member",
    ),

    firstName: z.string()
        .min(2, "First name must be at least 2 characters")
        .describe("Member's first name"),

    middleName: z.string().optional()
        .describe("Member's middle name (if applicable)"),

    lastName: z.string()
        .min(2, "Last name must be at least 2 characters")
        .describe("Member's last name"),

    gender: z.nativeEnum(Gender)
        .describe("Member's gender"),

    dateOfBirth: z.date()
        .refine(
            (date) => date <= new Date(),
            "Date of birth cannot be in the future",
        )
        .describe("Member's date of birth"),

    placeOfBirth: z.string().optional()
        .describe("Location where the member was born"),

    profilePhoto: z.string().url().optional()
        .describe("URL to the member's profile photo image"),
});

/**
 * TypeScript type for personal information
 */
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

/**
 * Default values for personal information
 */
export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
    firstName: "",
    lastName: "",
    gender: Gender.Male,
    dateOfBirth: new Date(),
};

/**
 * List of fields required on the personal information form
 */
export const REQUIRED_PERSONAL_FIELDS: (keyof PersonalInfo)[] = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
];
