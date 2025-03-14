import { z } from "zod";
import { MemberRole } from "@/constants";

/**
 * Schema for church information
 */
export const ChurchInfoSchema = z.object({
    formerChurch: z.string().optional()
        .describe(
            "Name of the church the member attended before joining this congregation",
        ),

    memberRole: z.nativeEnum(MemberRole)
        .describe("Member's role or position within the church"),

    isBaptized: z.boolean().default(false)
        .describe("Indicates if the member has been baptized"),

    isConfirmed: z.boolean().default(false)
        .describe("Indicates if the member has been confirmed"),

    partakesLordSupper: z.boolean().default(false)
        .describe(
            "Indicates if the member participates in communion/Lord's Supper",
        ),

    fellowshipId: z.string()
        .describe("ID of the fellowship group the member belongs to"),

    nearestMemberName: z.string().optional()
        .describe(
            "Name of another church member who lives close to this member",
        ),

    nearestMemberPhone: z.string().optional()
        .describe("Phone number of the nearest church member"),

    attendsFellowship: z.boolean().default(false)
        .describe(
            "Indicates if the member regularly attends fellowship meetings",
        ),

    fellowshipAbsenceReason: z.string().optional()
        .describe("Reason provided for not attending fellowship meetings"),
});

/**
 * TypeScript type for church information
 */
export type ChurchInfo = z.infer<typeof ChurchInfoSchema>;

/**
 * Default values for church information
 */
export const DEFAULT_CHURCH_INFO: ChurchInfo = {
    isBaptized: false,
    isConfirmed: false,
    partakesLordSupper: false,
    attendsFellowship: false,
    memberRole: MemberRole.Regular,
    fellowshipId: "",
};

/**
 * List of fields required on the church information form
 */
export const REQUIRED_CHURCH_FIELDS: (keyof ChurchInfo)[] = [
    "memberRole",
    "fellowshipId",
];

/**
 * Enhanced schema with refinements for fellowship absence reason
 */
export const ChurchInfoSchemaEnhanced = ChurchInfoSchema.refine(
    (data) => {
        // If member doesn't attend fellowship, a reason should be provided
        if (data.attendsFellowship === false) {
            return !!data.fellowshipAbsenceReason;
        }
        return true;
    },
    {
        message: "Please provide a reason for not attending fellowship",
        path: ["fellowshipAbsenceReason"],
    },
);

export const CHURCH_INFO_FIELDS: (keyof ChurchInfo)[] = [
    "formerChurch",
    "memberRole",
    "isBaptized",
    "isConfirmed",
    "partakesLordSupper",
    "fellowshipId",
    "nearestMemberName",
    "nearestMemberPhone",
    "attendsFellowship",
    "fellowshipAbsenceReason",
]