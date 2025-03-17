import { z } from "zod";
import { PersonalInfoSchema } from "./schemas.personal";
import { MaritalInfoSchema } from "./schemas.marital";
import { ContactInfoSchema } from "./schemas.contact";
import { ChurchInfoSchema } from "./schemas.church";
import { ProfessionalInfoSchema } from "./schemas.professional";
import {
    DependantInfo,
    DependantsSchema,
    SubmitDependantInfo,
} from "./schemas.dependants";
import { FormSectionKey, StepValidationMap } from "../types";
import { MaritalStatus } from "@/constants";
import { dateTransformer } from "@/data/_common";

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

    dependants: DependantsSchema,

    interests: z.array(z.string()).default([]),
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
export interface MemberFormSubmissionValues extends
    Omit<
        GeneralMemberFormValues,
        "dateOfBirth" | "dateOfMarriage" | "dependants"
    > {
    dateOfBirth: string;
    dateOfMarriage: string;
    dependants: SubmitDependantInfo[];
}

/**
 * Combined schema for the entire member form with transformation for API submission
 */
export const GeneralMemberFormSubmissionSchema = GeneralMemberFormSchemaBase
    .transform(
        (data): MemberFormSubmissionValues => {
            // Transform date fields to ISO strings for API submission
            const transformed: GeneralMemberFormValues = {
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

            if (data.des) {
                // Return transformed data - ready for API submission
                return transformed;
            }
        },
    );

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

    const checkValue = (value: any) => {
        return value !== undefined && value !== null && value !== "";
    };

    // Check if all required fields for this section have values
    const cond1 = fieldsToValidate.every((field) => {
        return checkValue(values[field]);
    });

    if (section === "marital") {
        if (values.maritalStatus === MaritalStatus.Married) {
            const cond2 = checkValue(values.dateOfMarriage) &&
                checkValue(values.placeOfMarriage) &&
                checkValue(values.spouseName) &&
                checkValue(values.spousePhoneNumber) &&
                checkValue(values.marriageType);
            return cond1 && cond2;
        }
    }

    return cond1;
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
