import { z } from "zod";

/**
 * Schema for contact information
 */
export const ContactInfoSchema = z.object({
    phoneNumber: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .describe("Member's primary phone number"),

    email: z.string().email().optional()
        .describe("Member's email address"),

    spousePhoneNumber: z.string().optional()
        .describe("Phone number of the member's spouse"),

    residenceNumber: z.string().optional()
        .describe(
            "Unique identifier for member's place of residence (e.g., house number)",
        ),

    residenceBlock: z.string().optional()
        .describe("Block or area designation within the residential area"),

    postalBox: z.string().optional()
        .describe("Member's postal box address"),

    residenceArea: z.string().optional()
        .describe(
            "Name of the neighborhood or community where the member resides",
        ),
});

/**
 * TypeScript type for contact information
 */
export type ContactInfo = z.infer<typeof ContactInfoSchema>;

/**
 * Default values for contact information
 */
export const DEFAULT_CONTACT_INFO: ContactInfo = {
    phoneNumber: "",
};

/**
 * List of fields required on the contact information form
 */
export const REQUIRED_CONTACT_FIELDS: (keyof ContactInfo)[] = [
    "phoneNumber",
];

/**
 * Regular expression for validating phone numbers
 * This is a simple example - adjust based on your specific format requirements
 */
export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

/**
 * Enhanced schema with more specific phone validation
 */
export const ContactInfoSchemaEnhanced = ContactInfoSchema.extend({
    phoneNumber: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(PHONE_REGEX, "Invalid phone number format")
        .describe("Member's primary phone number"),

    spousePhoneNumber: z.string()
        .regex(PHONE_REGEX, "Invalid phone number format")
        .optional()
        .describe("Phone number of the member's spouse"),
});

export const CONTACT_INFO_FIELDS: (keyof ContactInfo)[] = [
    "phoneNumber",
    "email",
    "spousePhoneNumber",
    "residenceNumber",
    "residenceBlock",
    "postalBox",
    "residenceArea",
];