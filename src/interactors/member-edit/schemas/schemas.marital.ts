import { z } from "zod";
import { MaritalStatus, MarriageType } from "@/constants";
import { CommonSchemas } from "@/data/_common";

/**
 * Schema for marital information
 */
export const MemberEditMaritalInfoSchema = z.object({
    maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.Single)
        .describe("Member's current marital status"),

    marriageType: z.nativeEnum(MarriageType).default(MarriageType.None)
        .describe("Type of marriage ceremony conducted"),

    dateOfMarriage: CommonSchemas.previousDate
        .optional().nullable()
        .describe("Date when the marriage was formalized"),

    spouseName: z.string()
        .optional().nullable()
        .describe("Full name of the member's spouse"),

    placeOfMarriage: z.string()
        .optional().nullable()
        .describe("Location where the marriage ceremony took place"),

    spousePhoneNumber: CommonSchemas.phoneNumber
        .optional().nullable()
        .describe("Phone number of the member's spouse"),
});

/**
 * TypeScript type for marital information
 */
export type MemberEditMaritalInfo = z.infer<
    typeof MemberEditMaritalInfoSchema
>;

/**
 * List of fields required on the marital information form
 */
export const REQUIRED_MEMBER_EDIT_MARITAL_INFO_FORM_FIELDS:
    (keyof MemberEditMaritalInfo)[] = [
        "maritalStatus",
    ];

/**
 * Fields that become required if the member is married
 */
export const CONDITIONAL_MEMBER_EDIT_MARRIED_FIELDS:
    (keyof MemberEditMaritalInfo)[] = [
        "marriageType",
        "dateOfMarriage",
        "spouseName",
        "spousePhoneNumber",
    ];

/**
 * Schema refinements for conditional validation based on marital status
 */
export const MemberEditMaritalInfoSchemaWithRefinements =
    MemberEditMaritalInfoSchema
        .refine(
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

export const MEMBER_EDIT_MARITAL_INFO_FORM_FIELDS:
    (keyof MemberEditMaritalInfo)[] = [
        "maritalStatus",
        "marriageType",
        "dateOfMarriage",
        "spouseName",
        "placeOfMarriage",
        "spousePhoneNumber",
    ];
