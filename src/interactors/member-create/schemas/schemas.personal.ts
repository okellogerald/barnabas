import { z } from "zod";
import { Gender } from "@/constants";
import { CommonSchemas } from "@/data/shared";

/**
 * Schema for personal information
 */
export const MemberCreatePersonalInfoSchema = z.object({
  firstName: CommonSchemas.name.describe("Member's first name"),

  middleName: CommonSchemas.name.optional().describe("Member's middle name (if applicable)"),

  lastName: CommonSchemas.name.describe("Member's last name"),

  gender: z.nativeEnum(Gender).describe("Member's gender"),

  dateOfBirth: CommonSchemas.previousDate.describe("Member's date of birth"),

  placeOfBirth: z.string().optional().describe("Location where the member was born"),

  profilePhoto: z.string().optional().describe("Filename of the member's profile photo image"),
});

/**
 * TypeScript type for personal information
 */
export type MemberCreatePersonalInfo = z.infer<typeof MemberCreatePersonalInfoSchema>;

/**
 * List of fields required on the personal information form
 */
export const REQUIRED_MEMBER_CREATE_PERSONAL_INFO_FORM_FIELDS: (keyof MemberCreatePersonalInfo)[] = [
  "firstName",
  "lastName",
  "gender",
  "dateOfBirth",
];
