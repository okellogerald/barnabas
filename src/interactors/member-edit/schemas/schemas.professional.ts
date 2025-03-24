import { z } from "zod";
import { EducationLevel } from "@/constants";

/**
 * Schema for professional information
 */
export const MemberEditProfessionalInfoSchema = z.object({
    occupation: z.string()
        .optional().nullable()
        .describe("Member's current job title or occupation"),

    placeOfWork: z.string()
        .optional().nullable()
        .describe("Name of the company or organization where the member works"),

    educationLevel: z.nativeEnum(EducationLevel)
        .default(EducationLevel.Primary)
        .describe("Highest level of education completed by the member"),

    profession: z.string()
        .optional().nullable()
        .describe("Member's professional field or area of expertise"),
});

/**
 * TypeScript type for professional information
 */
export type MemberEditProfessionalInfo = z.infer<
    typeof MemberEditProfessionalInfoSchema
>;

/**
 * List of fields required on the professional information form
 * Note: All fields in this section are optional
 */
export const REQUIRED_MEMBER_EDIT_PROFESSIONAL_INFO_FORM_FIELDS:
    (keyof MemberEditProfessionalInfo)[] = ["educationLevel"];
