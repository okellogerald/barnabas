import { z } from "zod";
import { DependantRelationship } from "@/constants";
import { CommonSchemas } from "@/data/_common";

/**
 * Schema for a single dependant
 */
export const MemberEditDependantSchema = z.object({
    firstName: CommonSchemas.name
        .min(2, "First name must be at least 2 characters")
        .describe("Dependant's first name"),

    lastName: CommonSchemas.name
        .describe("Dependant's last name"),

    dateOfBirth: CommonSchemas.previousDate
        .nullable().optional()
        .describe("Dependant's date of birth"),

    relationship: z.nativeEnum(DependantRelationship)
        .describe("Relationship of the dependant to the church member"),
});

/**
 * Schema for the dependants section - a list of dependants
 */
export const MemberEditDependantsSchema = z.object({
    dependants: z.array(MemberEditDependantSchema.extend({
        id: z.string(),
    })).default([])
        .describe("List of people who are dependants of the church member"),
    addDependants: z.array(MemberEditDependantSchema).default([])
        .describe("List of church member's newly added dependants"),
    removeDependantIds: z.array(z.string()).default([]).describe(
        "List of the ids of the church member's deleted dependants",
    ),
});

/**
 * TypeScript type for a single dependant
 */
export type DependantAddInfo = z.infer<typeof MemberEditDependantSchema>;

export type DependantInfo = z.infer<typeof MemberEditDependantSchema> & {
    id: string;
};

/**
 * TypeScript type for the dependants section
 */
export type DependantsInfo = z.infer<typeof MemberEditDependantsSchema>;

/**
 * Default values for the dependants section
 */
export const DEFAULT_DEPENDANTS_INFO: DependantsInfo = {
    dependants: [],
    addDependants: [],
    removeDependantIds: [],
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
