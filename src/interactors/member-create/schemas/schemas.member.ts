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
import dayjs from "dayjs";

/**
 * Convert a date object or dayjs object to ISO string format
 */
export const dateTransformer = (
    date: Date | dayjs.Dayjs | null | undefined,
): string => {
    if (!date) return "";

    // Handle dayjs object
    if (
        typeof date === "object" && "format" in date &&
        typeof date.format === "function"
    ) {
        return date.format("YYYY-MM-DD");
    }

    // Handle Date object
    if (date instanceof Date) {
        return date.toISOString().split("T")[0];
    }

    return "";
};

/**
 * Schema without transform for type inference
 */
export const MemberFormSchema = z.object({
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

    // Dependants
    ...DependantsSchema.shape,

    // Interests
    interests: z.array(z.string()).default([]),
});

/**
 * TypeScript type for form values before transformation
 */
export type MemberFormValues = z.infer<
    typeof MemberFormSchema
>;

/**
 * API submission type with string dates
 */
export interface MemberFormSubmissionValues extends
    Omit<
        MemberFormValues,
        "dateOfBirth" | "dateOfMarriage" | "dependants"
    > {
    dateOfBirth: string;
    dateOfMarriage: string | null;
    dependants: SubmitDependantInfo[];
}

/**
 * Combined schema for the entire member form with transformation for API submission
 */
export const MemberFormSubmissionSchema = MemberFormSchema
    .transform((data): MemberFormSubmissionValues => {
        // Transform date fields to ISO strings for API submission
        const transformed: any = {
            ...data,
        };

        // Transform personal dateOfBirth to string
        transformed.dateOfBirth = dateTransformer(data.dateOfBirth);

        // Transform marital dateOfMarriage to string
        transformed.dateOfMarriage = data.dateOfMarriage
            ? dateTransformer(data.dateOfMarriage)
            : null;

        // Transform dependants' dateOfBirth to string
        if (data.dependants && Array.isArray(data.dependants)) {
            transformed.dependants = data.dependants.map((dep) => ({
                ...dep,
                dateOfBirth: dateTransformer(dep.dateOfBirth),
            }));
        } else {
            transformed.dependants = [];
        }

        // Return transformed data - ready for API submission
        return transformed;
    });

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
    values: Partial<MemberFormValues>,
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
