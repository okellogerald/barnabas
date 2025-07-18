import { z } from "zod";
import { MemberCreatePersonalInfoSchema } from "./schemas.personal";
import { MemberCreateMaritalInfoSchema } from "./schemas.marital";
import { MemberCreateContactInfoSchema } from "./schemas.contact";
import { MemberCreateChurchInfoSchema } from "./schemas.church";
import { MemberCreateProfessionalInfoSchema } from "./schemas.professional";
import { DependantInfo, MemberCreateDependantsSchema } from "./schemas.dependants";
import { FormSectionKey, StepValidationMap } from "../types";
import { MaritalStatus } from "@/constants";
import { MemberCreateInterestsInfoSchema } from "./schemas.interests";

/**
 * Schema without transform for type inference
 */
export const MemberCreateFormSchema = z.object({
  // Personal Information
  ...MemberCreatePersonalInfoSchema.shape,

  // Marital Information
  ...MemberCreateMaritalInfoSchema.shape,

  // Contact Information
  ...MemberCreateContactInfoSchema.shape,

  // Church Information
  ...MemberCreateChurchInfoSchema.shape,

  // Professional Information
  ...MemberCreateProfessionalInfoSchema.shape,

  // Dependants
  ...MemberCreateDependantsSchema.shape,

  // Interests
  ...MemberCreateInterestsInfoSchema.shape,
});

/**
 * TypeScript type for form values before transformation
 */
export type MemberCreateFormValues = z.infer<typeof MemberCreateFormSchema>;

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
export function validateSection(values: Partial<MemberCreateFormValues>, section: FormSectionKey): boolean {
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
      const cond2 =
        checkValue(values.dateOfMarriage) &&
        checkValue(values.placeOfMarriage) &&
        checkValue(values.spouseName) &&
        checkValue(values.spousePhoneNumber) &&
        checkValue(values.marriageType);
      return cond1 && cond2;
    }
  }

  return cond1;
}

export function validateDependantSection(values: Partial<DependantInfo>): boolean {
  // if one field is set all the rest should be set
  if (values.dateOfBirth || values.firstName || values.lastName || values.relationship) {
    return (
      values.firstName !== undefined &&
      values.lastName !== undefined &&
      values.dateOfBirth !== undefined &&
      values.relationship !== undefined
    );
  }
  return true;
}
