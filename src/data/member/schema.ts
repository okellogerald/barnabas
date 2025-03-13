import { z } from "zod";
import { enums, idSchema, timestampFields } from "@/data/_common";
import { fellowshipSchema } from "../fellowship";

// Dependant schema for a member's dependant
export const dependantSchema = z.object({
    id: idSchema,
    churchId: idSchema,
    memberId: idSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().nullable(),
    relationship: enums.dependantRelationship,
    ...timestampFields,
});

export type DependantDTO = z.infer<typeof dependantSchema>;

const createDependantSchema = dependantSchema.omit({
    id: true,
    churchId: true,
    memberId: true,
    createdAt: true,
    updatedAt: true,
});

const updateDependantSchema = dependantSchema.omit({
    churchId: true,
    memberId: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({ id: idSchema.optional() });

const interestSchema = z.object({
    id: idSchema,
    churchId: idSchema,
    name: z.string(),
    description: z.string().nullable(),
    ...timestampFields,
});

// Base member schema
export const memberSchema = z.object({
    id: idSchema,
    churchId: idSchema,
    envelopeNumber: z.string().nullable(),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().nullable(),
    lastName: z.string().min(1, "Last name is required"),
    gender: enums.gender,
    dateOfBirth: z.string().nullable(),
    placeOfBirth: z.string().nullable(),
    profilePhoto: z.string().nullable(),
    maritalStatus: enums.maritalStatus,
    marriageType: enums.marriageType.nullable(),
    dateOfMarriage: z.string().nullable(),
    spouseName: z.string().nullable(),
    placeOfMarriage: z.string().nullable(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email("Must be a valid email").nullable(),
    spousePhoneNumber: z.string().nullable(),
    residenceNumber: z.string().nullable(),
    residenceBlock: z.string().nullable(),
    postalBox: z.string().nullable(),
    residenceArea: z.string().nullable(),
    formerChurch: z.string().nullable(),
    occupation: z.string().nullable(),
    placeOfWork: z.string().nullable(),
    educationLevel: enums.educationLevel,
    profession: z.string().nullable(),
    memberRole: enums.memberRole,
    isBaptized: z.boolean(),
    isConfirmed: z.boolean(),
    partakesLordSupper: z.boolean(),
    fellowshipId: idSchema.nullable(),
    fellowship: fellowshipSchema.nullable(),
    nearestMemberName: z.string().nullable(),
    nearestMemberPhone: z.string().nullable(),
    attendsFellowship: z.boolean(),
    fellowshipAbsenceReason: z.string().nullable(),
    ...timestampFields,

    // Optional related collections
    dependants: z.array(dependantSchema).optional(),
    interests: z.array(interestSchema).optional(),
});

export type MemberDTO = z.infer<typeof memberSchema>;

// Schema for creating a new member
export const createMemberSchema = memberSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    dependants: z.array(createDependantSchema).optional(),
    interests: z.array(idSchema).optional(),
});

export type CreateMemberDTO = z.infer<typeof createMemberSchema>;

// Schema for updating an existing member
export const updateMemberSchema = memberSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({
    dependants: z.array(updateDependantSchema).optional(),
    addDependants: z.array(createDependantSchema).optional(),
    removeDependantIds: z.array(idSchema).optional(),
    interests: z.array(idSchema).optional(),
});

export type UpdateMemberDTO = z.infer<typeof updateMemberSchema>;

// Define query parameters for getAll
export const memberQueryParamsSchema = z.object({
    eager: z.string().optional().default("fellowship,interests"),
    rangeStart: z.coerce.number().optional().default(0),
    rangeEnd: z.coerce.number().optional().default(9),
    search: z.string().optional(),
    fellowshipId: z.string().optional(),
    gender: z.string().optional(),
    memberRole: z.string().optional(),
    baptized: z.coerce.boolean().optional(),
    confirmed: z.coerce.boolean().optional(),
    attendsFellowship: z.coerce.boolean().optional(),
    // sortBy: z.string().optional().default("firstName"),
    // sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type MemberQueryParams = z.infer<typeof memberQueryParamsSchema>;
