import { z } from "zod";
import { MaritalStatus, MarriageType } from "@/constants";

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
                !!data.spouseName;
        }
        return true;
    },
    {
        message:
            "Marriage type, date, and spouse name are required for married members",
        path: ["marriageType", "dateOfMarriage", "spouseName"],
    },
);

export const MARITAL_INFO_FIELDS: (keyof MaritalInfo)[] = [
    "maritalStatus",
    "marriageType",
    "dateOfMarriage",
    "spouseName",
    "placeOfMarriage",
];
