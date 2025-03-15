import { ReactNode } from "react";
import { GeneralMemberFormValues } from "./schemas/schemas.member";

/**
 * Step definition
 */
export interface StepDefinition {
    title: string;
    description: string;
    icon: ReactNode;
    key: FormSectionKey;
}

/**
 * Form section keys
 */
export type FormSectionKey =
    | "personal"
    | "marital"
    | "contact"
    | "church"
    | "professional"
    | "dependants"
    | "interests";

/**
 * Section-specific key types for type safety
 */
export type PersonalInfoKeys =
    | "envelopeNumber"
    | "firstName"
    | "middleName"
    | "lastName"
    | "gender"
    | "dateOfBirth"
    | "placeOfBirth"
    | "profilePhoto";

export type MaritalInfoKeys =
    | "maritalStatus"
    | "marriageType"
    | "dateOfMarriage"
    | "spouseName"
    | "spousePhoneNumber"
    | "placeOfMarriage";

export type ContactInfoKeys =
    | "phoneNumber"
    | "email"
    | "residenceNumber"
    | "residenceBlock"
    | "postalBox"
    | "residenceArea";

export type ChurchInfoKeys =
    | "formerChurch"
    | "memberRole"
    | "isBaptized"
    | "isConfirmed"
    | "partakesLordSupper"
    | "fellowshipId"
    | "nearestMemberName"
    | "nearestMemberPhone"
    | "attendsFellowship"
    | "fellowshipAbsenceReason";

export type ProfessionalInfoKeys =
    | "occupation"
    | "placeOfWork"
    | "educationLevel"
    | "profession";

/**
 * Step validation map
 */
export type StepValidationMap = Record<
    FormSectionKey,
    (keyof GeneralMemberFormValues)[]
>;
