import { z } from "zod";
import { EducationLevel } from "@/constants";

/**
 * Schema for professional information
 */
export const MemberCreateProfessionalInfoSchema = z.object({
    occupation: z.string().optional()
        .describe("Member's current job title or occupation"),

    placeOfWork: z.string().optional()
        .describe("Name of the company or organization where the member works"),

    educationLevel: z.nativeEnum(EducationLevel)
        .default(EducationLevel.Primary)
        .describe("Highest level of education completed by the member"),

    profession: z.string().optional()
        .describe("Member's professional field or area of expertise"),
});

/**
 * TypeScript type for professional information
 */
export type MemberCreateProfessionalInfo = z.infer<
    typeof MemberCreateProfessionalInfoSchema
>;

// /**
//  * Default values for professional information
//  */
// export const DEFAULT_PROFESSIONAL_INFO: MemberCreateProfessionalInfo = {
//     educationLevel: EducationLevel.Primary,
// };

/**
 * List of fields required on the professional information form
 * Note: All fields in this section are optional
 */
export const REQUIRED_MEMBER_CREATE_PROFESSIONAL_INFO_FORM_FIELDS:
    (keyof MemberCreateProfessionalInfo)[] = ["educationLevel"];
