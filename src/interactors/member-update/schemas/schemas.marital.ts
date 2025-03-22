import { z } from "zod";
import { MaritalStatus, MarriageType } from "@/constants";
import { CommonSchemas } from "@/data/_common";

/**
 * Schema for marital information
 */
export const MemberCreateMaritalInfoSchema = z.object({
    maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.Single)
        .describe("Member's current marital status"),

    marriageType: z.nativeEnum(MarriageType).default(MarriageType.None)
        .describe("Type of marriage ceremony conducted"),

    dateOfMarriage: CommonSchemas.previousDate
        .optional()
        .describe("Date when the marriage was formalized"),

    spouseName: z.string().optional()
        .describe("Full name of the member's spouse"),

    placeOfMarriage: z.string().optional()
        .describe("Location where the marriage ceremony took place"),

    spousePhoneNumber: CommonSchemas.phoneNumber
        .optional()
        .describe("Phone number of the member's spouse"),
});

/**
 * TypeScript type for marital information
 */
export type MemberCreateMaritalInfo = z.infer<
    typeof MemberCreateMaritalInfoSchema
>;

// /**
//  * Default values for marital information
//  */
// export const DEFAULT_MARITAL_INFO: MaritalInfo = {
//     maritalStatus: MaritalStatus.Single,
// };

/**
 * List of fields required on the marital information form
 */
export const REQUIRED_MEMBER_CREATE_MARITAL_INFO_FORM_FIELDS:
    (keyof MemberCreateMaritalInfo)[] = [
        "maritalStatus",
    ];

/**
 * Fields that become required if the member is married
 */
export const CONDITIONAL_MEMBER_CREATE_MARRIED_FIELDS:
    (keyof MemberCreateMaritalInfo)[] = [
        "marriageType",
        "dateOfMarriage",
        "spouseName",
        "spousePhoneNumber",
    ];

/**
 * Schema refinements for conditional validation based on marital status
 */
export const MemberCreateMaritalInfoSchemaWithRefinements =
    MemberCreateMaritalInfoSchema
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

export const MEMBER_CREATE_MARITAL_INFO_FORM_FIELDS:
    (keyof MemberCreateMaritalInfo)[] = [
        "maritalStatus",
        "marriageType",
        "dateOfMarriage",
        "spouseName",
        "placeOfMarriage",
        "spousePhoneNumber",
    ];
