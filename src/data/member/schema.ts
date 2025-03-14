import { z } from "zod";
import { idSchema, timestampFields } from "@/data/_common";
import { fellowshipSchema } from "../fellowship";
import { DependantRelationship, EducationLevel, Gender, MaritalStatus, MarriageType, MemberRole } from "@/constants";

// Dependant schema for a member's dependant
export const dependantSchema = z.object({
    id: idSchema,
    churchId: idSchema,
    memberId: idSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().nullable(),
    relationship: z.nativeEnum(DependantRelationship),
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
    envelopeNumber: z.string().nullable().optional(),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().nullable().optional(),
    lastName: z.string().min(1, "Last name is required"),
    gender: z.nativeEnum(Gender),
    dateOfBirth: z.string().nullable().optional(),
    placeOfBirth: z.string().nullable().optional(),
    profilePhoto: z.string().nullable().optional(),
    maritalStatus: z.nativeEnum(MaritalStatus),
    marriageType: z.nativeEnum(MarriageType).nullable().optional(),
    dateOfMarriage: z.string().nullable().optional(),
    spouseName: z.string().nullable().optional(),
    placeOfMarriage: z.string().nullable().optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email("Must be a valid email").nullable().optional(),
    spousePhoneNumber: z.string().nullable().optional(),
    residenceNumber: z.string().nullable().optional(),
    residenceBlock: z.string().nullable().optional(),
    postalBox: z.string().nullable().optional(),
    residenceArea: z.string().nullable().optional(),
    formerChurch: z.string().nullable().optional(),
    occupation: z.string().nullable().optional(),
    placeOfWork: z.string().nullable().optional(),
    educationLevel: z.nativeEnum(EducationLevel),
    profession: z.string().nullable().optional(),
    memberRole: z.nativeEnum(MemberRole),
    isBaptized: z.boolean(),
    isConfirmed: z.boolean(),
    partakesLordSupper: z.boolean(),
    fellowshipId: idSchema.nullable().optional(),
    fellowship: fellowshipSchema.nullable().optional(),
    nearestMemberName: z.string().nullable().optional(),
    nearestMemberPhone: z.string().nullable().optional(),
    attendsFellowship: z.boolean(),
    fellowshipAbsenceReason: z.string().nullable().optional(),
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
    fellowship: true,
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
