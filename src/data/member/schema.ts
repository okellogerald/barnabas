import { z } from "zod";
import { CommonSchemas } from "@/data/_common";
import { fellowshipSchema } from "../fellowship";
import {
    DependantRelationship,
    EducationLevel,
    Gender,
    MaritalStatus,
    MarriageType,
    MemberRole,
} from "@/constants";
import { OpportunitySchemas } from "../volunteer";

// Dependant schema for a member's dependant
const dependantSchema = z.object({
    id: CommonSchemas.id,
    ...CommonSchemas.systemDates,

    churchId: CommonSchemas.id,
    memberId: CommonSchemas.id,

    firstName: CommonSchemas.name,
    lastName: CommonSchemas.name,
    dateOfBirth: CommonSchemas.date.nullable().optional(),
    relationship: z.nativeEnum(DependantRelationship),
});

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
}).partial().extend({ id: CommonSchemas.id.optional() });

// Base member schema
const memberSchema = z.object({
    // system created
    id: CommonSchemas.id,
    ...CommonSchemas.systemDates,

    churchId: CommonSchemas.id,

    // comes with eager set to include "fellowship"
    fellowship: fellowshipSchema.nullable().optional(),

    // required
    fellowshipId: CommonSchemas.id,
    firstName: CommonSchemas.name,
    dateOfBirth: CommonSchemas.date,
    lastName: CommonSchemas.name,
    phoneNumber:CommonSchemas.phoneNumber,
    gender: z.nativeEnum(Gender).default(Gender.Male),
    memberRole: z.nativeEnum(MemberRole).default(MemberRole.Regular),
    maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.Single),
    marriageType: z.nativeEnum(MarriageType).default(MarriageType.None),
    educationLevel: z.nativeEnum(EducationLevel).default(EducationLevel.Primary),
    middleName: CommonSchemas.name.nullable().optional(),

    // with default
    isBaptized: z.boolean().default(false),
    isConfirmed: z.boolean().default(false),
    partakesLordSupper: z.boolean().default(false),
    attendsFellowship: z.boolean().default(false),

    // optional
    envelopeNumber: z.string().nullable().optional(),
    placeOfBirth: z.string().nullable().optional(),
    profilePhoto: z.string().nullable().optional(),
    dateOfMarriage: CommonSchemas.date.nullable().optional(),
    spouseName: CommonSchemas.name.nullable().optional(),
    placeOfMarriage: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    spousePhoneNumber: CommonSchemas.phoneNumber.nullable().optional(),
    residenceNumber: z.string().nullable().optional(),
    residenceBlock: z.string().nullable().optional(),
    postalBox: z.string().nullable().optional(),
    residenceArea: z.string().nullable().optional(),
    formerChurch: z.string().nullable().optional(),
    occupation: z.string().nullable().optional(),
    placeOfWork: z.string().nullable().optional(),
    profession: z.string().nullable().optional(),
    nearestMemberName: CommonSchemas.name.nullable().optional(),
    nearestMemberPhone: CommonSchemas.phoneNumber.nullable().optional(),
    fellowshipAbsenceReason: z.string().nullable().optional(),
    // Optional related collections
    dependants: z.array(dependantSchema).optional(),
    interests: OpportunitySchemas.opportunityArray.optional(),
});

// Schema for creating a new member
const createMemberSchema = memberSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
    fellowship: true,
}).extend({
    dependants: z.array(createDependantSchema).optional(),
    interests: z.array(CommonSchemas.id).optional(),
});

// Schema for updating an existing member
const updateMemberSchema = memberSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({
    dependants: z.array(updateDependantSchema).optional(),
    addDependants: z.array(createDependantSchema).optional(),
    removeDependantIds: z.array(CommonSchemas.id).optional(),
    interests: z.array(CommonSchemas.id).optional(),
});

// Define query parameters for getAll
const memberQueryParamsSchema = z.object({
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

export const MemberSchemas = {
    memberSchema: memberSchema,
    createMemberSchema: createMemberSchema,
    updateMemberSchema: updateMemberSchema,
    queryParamsSchema: memberQueryParamsSchema,
    paginatedListResult: CommonSchemas.createPaginatedResponseSchema(
        memberSchema,
    ),
};

export type MemberDTO = z.infer<typeof memberSchema>;
export type CreateMemberDTO = z.infer<typeof createMemberSchema>;
export type UpdateMemberDTO = z.infer<typeof updateMemberSchema>;
export type DependantDTO = z.infer<typeof dependantSchema>;
export type MemberQueryParams = z.infer<typeof memberQueryParamsSchema>;
