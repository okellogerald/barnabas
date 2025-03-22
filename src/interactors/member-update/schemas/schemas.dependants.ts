import { z } from "zod";
import { DependantRelationship } from "@/constants";
import { CommonSchemas } from "@/data/_common";

/**
 * Schema for a single dependant
 */
export const MemberCreateDependantSchema = z.object({
    firstName: CommonSchemas.name
        .min(2, "First name must be at least 2 characters")
        .describe("Dependant's first name"),

    lastName: CommonSchemas.name
        .describe("Dependant's last name"),

    dateOfBirth: CommonSchemas.previousDate
        .describe("Dependant's date of birth"),

    relationship: z.nativeEnum(DependantRelationship)
        .describe("Relationship of the dependant to the church member"),
});

/**
 * Schema for the dependants section - a list of dependants
 */
export const MemberCreateDependantsSchema = z.object({
    dependants: z.array(MemberCreateDependantSchema).default([])
        .describe("List of people who are dependants of the church member"),
});

/**
 * TypeScript type for a single dependant
 */
export type DependantInfo = z.infer<typeof MemberCreateDependantSchema> & {
    id?: string;
};

/**
 * TypeScript type for the dependants section
 */
export type DependantsInfo = z.infer<typeof MemberCreateDependantsSchema>;

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
