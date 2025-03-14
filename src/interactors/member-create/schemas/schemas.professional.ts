import { z } from "zod";
import { EducationLevel } from "@/constants";

/**
 * Schema for professional information
 */
export const ProfessionalInfoSchema = z.object({
    occupation: z.string().optional()
        .describe("Member's current job title or occupation"),

    placeOfWork: z.string().optional()
        .describe("Name of the company or organization where the member works"),

    educationLevel: z.nativeEnum(EducationLevel)
        .describe("Highest level of education completed by the member"),

    profession: z.string().optional()
        .describe("Member's professional field or area of expertise"),
});

/**
 * TypeScript type for professional information
 */
export type ProfessionalInfo = z.infer<typeof ProfessionalInfoSchema>;

/**
 * Default values for professional information
 */
export const DEFAULT_PROFESSIONAL_INFO: ProfessionalInfo = {
    educationLevel: EducationLevel.Primary
};

/**
 * List of fields required on the professional information form
 * Note: All fields in this section are optional
 */
export const REQUIRED_PROFESSIONAL_FIELDS: (keyof ProfessionalInfo)[] = [];
