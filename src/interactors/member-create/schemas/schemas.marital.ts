import { z } from "zod";
import { MaritalStatus, MarriageType } from "@/constants";
import { PHONE_REGEX } from "./schemas.contact";

/**
 * Schema for marital information
 */
export const MaritalInfoSchema = z.object({
    maritalStatus: z.nativeEnum(MaritalStatus)
        .describe("Member's current marital status"),

    marriageType: z.nativeEnum(MarriageType).optional()
        .describe("Type of marriage ceremony conducted"),

    dateOfMarriage: z.date().optional()
        .refine(
            (date) => !date || date <= new Date(),
            "Date of marriage cannot be in the future",
        )
        .describe("Date when the marriage was formalized"),

    spouseName: z.string().optional()
        .describe("Full name of the member's spouse"),

    placeOfMarriage: z.string().optional()
        .describe("Location where the marriage ceremony took place"),

    spousePhoneNumber: z.string()
        .regex(PHONE_REGEX, "Invalid phone number format")
        .optional()
        .describe("Phone number of the member's spouse"),
});

/**
 * TypeScript type for marital information
 */
export type MaritalInfo = z.infer<typeof MaritalInfoSchema>;

/**
 * Default values for marital information
 */
export const DEFAULT_MARITAL_INFO: MaritalInfo = {
    maritalStatus: MaritalStatus.Single,
};

/**
 * List of fields required on the marital information form
 */
export const REQUIRED_MARITAL_FIELDS: (keyof MaritalInfo)[] = [
    "maritalStatus",
];

/**
 * Fields that become required if the member is married
 */
export const CONDITIONAL_MARRIED_FIELDS: (keyof MaritalInfo)[] = [
    "marriageType",
    "dateOfMarriage",
    "spouseName",
    "spousePhoneNumber",
];

/**
 * Schema refinements for conditional validation based on marital status
 */
export const MaritalInfoSchemaWithRefinements = MaritalInfoSchema.refine(
    (data) => {
        // If the member is married, certain fields become required
        if (data.maritalStatus === MaritalStatus.Married) {
            return !!data.marriageType &&
                !!data.dateOfMarriage &&
                !!data.spouseName && !!data.spousePhoneNumber;
        }
        return true;
    },
    {
        message:
            "Marriage type, date, spouse name and spouse phone number are required for married members",
        path: [
            "marriageType",
            "dateOfMarriage",
            "spouseName",
            "spousePhoneNumber",
        ],
    },
);

export const MARITAL_INFO_FIELDS: (keyof MaritalInfo)[] = [
    "maritalStatus",
    "marriageType",
    "dateOfMarriage",
    "spouseName",
    "placeOfMarriage",
    "spousePhoneNumber",
];
