import { z } from "zod";
import { MemberEditPersonalInfoSchema } from "./schemas.personal";
import { MemberEditMaritalInfoSchema } from "./schemas.marital";
import { MemberEditContactInfoSchema } from "./schemas.contact";
import { MemberEditChurchInfoSchema } from "./schemas.church";
import { MemberEditProfessionalInfoSchema } from "./schemas.professional";
import {
    DependantInfo,
    MemberEditDependantsSchema,
} from "./schemas.dependants";
import { FormSectionKey, StepValidationMap } from "../types";
import { MaritalStatus } from "@/constants";
import { MemberEditInterestsInfoSchema } from "./schemas.interests";

/**
 * Schema without transform for type inference
 */
export const MemberEditFormSchema = z.object({
    // Personal Information
    ...MemberEditPersonalInfoSchema.shape,

    // Marital Information
    ...MemberEditMaritalInfoSchema.shape,

    // Contact Information
    ...MemberEditContactInfoSchema.shape,

    // Church Information
    ...MemberEditChurchInfoSchema.shape,

    // Professional Information
    ...MemberEditProfessionalInfoSchema.shape,

    // Dependants
    ...MemberEditDependantsSchema.shape,

    // Interests
    ...MemberEditInterestsInfoSchema.shape,
});

/**
 * TypeScript type for form values before transformation
 */
export type MemberEditFormValues = z.infer<
    typeof MemberEditFormSchema
>;

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
    values: Partial<MemberEditFormValues>,
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
                checkValue(values.spouseName) &&
                checkValue(values.spousePhoneNumber) &&
                checkValue(values.marriageType);
            return cond1 && cond2;
        }
    }
    
    if (section === "church") {
        if (values.attendsFellowship === false) {
            // If member doesn't attend fellowship, a reason should be provided
            const cond2 = checkValue(values.fellowshipAbsenceReason);
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