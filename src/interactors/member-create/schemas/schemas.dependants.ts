import { z } from "zod";
import { DependantRelationship } from "@/constants";
import dayjs from "dayjs";
import { dayjsSchema } from "@/data/_common";

/**
 * Schema for a single dependant
 */
export const DependantSchema = z.object({
    firstName: z.string()
        .min(2, "First name must be at least 2 characters")
        .describe("Dependant's first name"),

    lastName: z.string()
        .min(2, "Last name must be at least 2 characters")
        .describe("Dependant's last name"),

    dateOfBirth: dayjsSchema
        .refine(
            (date) => date.isBefore(dayjs()) || date.isSame(dayjs(), "day"),
            "Date of birth cannot be in the future",
        )
        .describe("Dependant's date of birth"),

    relationship: z.nativeEnum(DependantRelationship)
        .describe("Relationship of the dependant to the church member"),
});

/**
 * Schema for the dependants section - a list of dependants
 */
export const DependantsSchema = z.object({
    dependants: z.array(DependantSchema).default([])
        .describe("List of people who are dependants of the church member"),
});

/**
 * TypeScript type for a single dependant
 */
export type DependantInfo = z.infer<typeof DependantSchema> & { id?: string };

export interface SubmitDependantInfo extends Omit<DependantInfo, "dateOfBirth"> {
    dateOfBirth: string;
}

/**
 * TypeScript type for the dependants section
 */
export type DependantsInfo = z.infer<typeof DependantsSchema>;

/**
 * Default values for the dependants section
 */
export const DEFAULT_DEPENDANTS_INFO: DependantsInfo = {
    dependants: [],
};

/**
 * List of fields required for each dependant
 */
export const REQUIRED_DEPENDANT_FIELDS: (keyof DependantInfo)[] = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "relationship",
];
