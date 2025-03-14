import { z } from "zod";
import { PersonalInfoSchema } from "./schemas.personal";
import { MaritalInfoSchema } from "./schemas.marital";
import { ContactInfoSchema } from "./schemas.contact";
import { ChurchInfoSchema } from "./schemas.church";
import { ProfessionalInfoSchema } from "./schemas.professional";
import { DependantSchema } from "./schemas.dependants";
import { FormSectionKey, StepValidationMap } from "../types";
import dayjs from "dayjs";

/**
 * Transforms a date field to an ISO string
 */
const dateTransformer = (date: Date) => dayjs(date).format("YYYY-MM-DD");

/**
 * Schema without transform for type inference
 */
export const MemberFormSchemaBase = z.object({
    // Personal Information
    ...PersonalInfoSchema.shape,

    // Marital Information
    ...MaritalInfoSchema.shape,

    // Contact Information
    ...ContactInfoSchema.shape,

    // Church Information
    ...ChurchInfoSchema.shape,

    // Professional Information
    ...ProfessionalInfoSchema.shape,

    // Dependants - array of dependants
    dependants: z.array(DependantSchema).default([]),

    // Interests - array of volunteer opportunity IDs
    interests: z.array(z.string()).default([]),
});

/**
 * TypeScript type for form values before transformation
 */
export type MemberFormValues = z.infer<typeof MemberFormSchemaBase>;

/**
 * API submission type with string dates
 */
export interface MemberFormSubmission
    extends Omit<MemberFormValues, "dateOfBirth" | "dateOfMarriage"> {
    dateOfBirth?: string;
    dateOfMarriage?: string;
}

/**
 * Combined schema for the entire member form with transformation for API submission
 */
export const MemberFormSchema = MemberFormSchemaBase.transform(
    (data): MemberFormSubmission => {
        // Transform date fields to ISO strings for API submission
        const transformed: MemberFormSubmission = { ...data } as any;

        if (data.dateOfBirth) {
            transformed.dateOfBirth = dateTransformer(data.dateOfBirth);
        }

        if (data.dateOfMarriage) {
            transformed.dateOfMarriage = dateTransformer(data.dateOfMarriage);
        }

        // Return transformed data - ready for API submission
        return transformed;
    },
);

/**
 * TypeScript type for the entire member form
 */
export type MemberFormSubmissionValues = z.infer<typeof MemberFormSchema>;

/**
 * Step validation map - fields to validate for each step
 */
export const STEP_VALIDATION_MAP: StepValidationMap = {
    personal: ["firstName", "lastName", "gender", "dateOfBirth"],
    marital: ["maritalStatus"],
    contact: ["phoneNumber"],
    church: ["memberRole", "fellowshipId"],
    professional: [],
    dependants: [],
    interests: [],
};

/**
 * Validates the form values for a specific section
 *
 * @param values The form values to validate
 * @param section The form section to validate
 * @returns True if the section is valid, false otherwise
 */
export function validateSection(
    values: Partial<MemberFormValues>,
    section: FormSectionKey,
): boolean {
    const fieldsToValidate = STEP_VALIDATION_MAP[section];

    // Check if all required fields for this section have values
    return fieldsToValidate.every((field) => {
        const value = values[field];
        return value !== undefined && value !== null && value !== "";
    });
}
