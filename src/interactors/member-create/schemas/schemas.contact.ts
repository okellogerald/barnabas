import { CommonSchemas } from "@/data/shared";
import { z } from "zod";

/**
 * Schema for contact information
 */
export const MemberCreateContactInfoSchema = z.object({
  phoneNumber: CommonSchemas.phoneNumber.describe("Member's primary phone number"),

  email: z.string().email().optional().describe("Member's email address"),

  residenceNumber: z
    .string()
    .optional()
    .describe("Unique identifier for member's place of residence (e.g., house number)"),

  residenceBlock: z.string().optional().describe("Block or area designation within the residential area"),

  postalBox: z.string().optional().describe("Member's postal box address"),

  residenceArea: z.string().optional().describe("Name of the neighborhood or community where the member resides"),
});

/**
 * TypeScript type for contact information
 */
export type MemberCreateContactInfo = z.infer<typeof MemberCreateContactInfoSchema>;

/**
 * List of fields required on the contact information form
 */
export const REQUIRED_MEMBER_CREATE_CONTACT_INFO_FORM_FIELDS: (keyof MemberCreateContactInfo)[] = ["phoneNumber"];

/**
 * Regular expression for validating phone numbers
 * This is a simple example - adjust based on your specific format requirements
 */
export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export const MEMBER_CREATE_CONTACT_INFO_FORM_FIELDS: (keyof MemberCreateContactInfo)[] = [
  "phoneNumber",
  "email",
  "residenceNumber",
  "residenceBlock",
  "postalBox",
  "residenceArea",
];
