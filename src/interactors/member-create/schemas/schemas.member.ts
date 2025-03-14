import { z } from "zod";
import { PersonalInfoSchema } from "./schemas.personal";
import { MaritalInfoSchema } from "./schemas.marital";
import { ContactInfoSchema } from "./schemas.contact";
import { ChurchInfoSchema } from "./schemas.church";
import { ProfessionalInfoSchema } from "./schemas.professional";
import { DependantInfo } from "./schemas.dependants";
import { FormSectionKey, StepValidationMap } from "../types";
import dayjs from "dayjs";

/**
 * Transforms a date field to an ISO string
 */
const dateTransformer = (date: Date) => dayjs(date).format("YYYY-MM-DD");

/**
 * Schema without transform for type inference
 */
export const GeneralMemberFormSchemaBase = z.object({
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
});

/**
 * TypeScript type for form values before transformation
 */
export type GeneralMemberFormValues = z.infer<
    typeof GeneralMemberFormSchemaBase
>;

/**
 * API submission type with string dates
 */
export interface MemberFormSubmissionValues
    extends GeneralMemberFormSubmissionValues {
    // Dependants - array of dependants
    dependants: DependantInfo[];

    // Interests - array of volunteer opportunity IDs
    interests: string[];
}

export interface GeneralMemberFormSubmissionValues
    extends Omit<GeneralMemberFormValues, "dateOfBirth" | "dateOfMarriage"> {
    dateOfBirth: string;
    dateOfMarriage: string;
}

/**
 * Combined schema for the entire member form with transformation for API submission
 */
export const GeneralMemberFormSubmissionSchema = GeneralMemberFormSchemaBase
    .transform(
        (data): GeneralMemberFormSubmissionValues => {
            // Transform date fields to ISO strings for API submission
            const transformed: GeneralMemberFormSubmissionValues = {
                ...data,
            } as any;

            if (data.dateOfBirth) {
                transformed.dateOfBirth = dateTransformer(data.dateOfBirth);
            }

            if (data.dateOfMarriage) {
                transformed.dateOfMarriage = dateTransformer(
                    data.dateOfMarriage,
                );
            }

            // Return transformed data - ready for API submission
            return transformed;
        },
    );

// /**
//  * TypeScript type for the entire member form
//  */
// export type MemberFormSubmissionValues = z.infer<
//     typeof MemberFormSubmissionSchema
// >;

/**
 * Step validation map - fields to validate for each step
 */
export const STEP_VALIDATION_MAP: StepValidationMap = {
    personal: ["firstName", "lastName", "gender", "dateOfBirth"],
    marital: ["maritalStatus"],
    contact: ["phoneNumber"],
    church: ["memberRole", "fellowshipId"],
    professional: ["educationLevel"],
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
    values: Partial<GeneralMemberFormValues>,
    section: FormSectionKey,
): boolean {
    const fieldsToValidate = STEP_VALIDATION_MAP[section];

    // Check if all required fields for this section have values
    return fieldsToValidate.every((field) => {
        const value = values[field];
        return value !== undefined && value !== null && value !== "";
    });
}

export function validateDependantSection(
    values: Partial<DependantInfo>,
): boolean {
    // if one field is set all the rest should be set
    if (
        values.dateOfBirth || values.firstName || values.lastName ||
        values.relationship
    ) {
        return values.firstName !== undefined &&
            values.lastName !== undefined &&
            values.dateOfBirth !== undefined &&
            values.relationship !== undefined;
    }
    return true;
}
