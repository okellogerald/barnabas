import { z } from "zod";
import { MemberRole } from "@/constants";
import { CommonSchemas } from "@/data/shared";

/**
 * Schema for church information
 */
export const MemberCreateChurchInfoSchema = z.object({
  formerChurch: z
    .string()
    .optional()
    .describe(
      "Name of the church the member attended before joining this congregation"
    ),

  memberRole: z
    .nativeEnum(MemberRole)
    .default(MemberRole.Regular)
    .describe("Member's role or position within the church"),

  isBaptized: z
    .boolean()
    .default(false)
    .describe("Indicates if the member has been baptized"),

  isConfirmed: z
    .boolean()
    .default(false)
    .describe("Indicates if the member has been confirmed"),

  partakesLordSupper: z
    .boolean()
    .default(false)
    .describe(
      "Indicates if the member participates in communion/Lord's Supper"
    ),

  fellowshipId: z
    .string()
    .describe("ID of the fellowship group the member belongs to"),

  nearestMemberName: CommonSchemas.name.describe(
    "Name of another church member who lives close to this member"
  ),

  nearestMemberPhone: CommonSchemas.phoneNumber.describe(
    "Phone number of the nearest church member"
  ),

  attendsFellowship: z
    .boolean()
    .default(false)
    .describe("Indicates if the member regularly attends fellowship meetings"),

  fellowshipAbsenceReason: z
    .string()
    .optional()
    .describe("Reason provided for not attending fellowship meetings"),
});

/**
 * TypeScript type for church information
 */
export type MemberCreateChurchInfo = z.infer<
  typeof MemberCreateChurchInfoSchema
>;

/**
 * List of fields required on the church information form
 */
export const REQUIRED_MEMBER_CREATE_CHURCH_INFO_FORM_FIELDS: (keyof MemberCreateChurchInfo)[] =
  ["memberRole", "fellowshipId", "nearestMemberName", "nearestMemberPhone"];

/**
 * Enhanced schema with refinements for fellowship absence reason
 */
export const MemberCreateEnhancedChurchInfoSchema =
  MemberCreateChurchInfoSchema.refine(
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
    }
  );

export const CHURCH_INFO_FIELDS: (keyof MemberCreateChurchInfo)[] = [
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
];
