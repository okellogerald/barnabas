import { z } from "zod";
import { CommonSchemas } from "@/data/_common";
import { MemberSchemas } from "../member";

// Base fellowship schema
export const fellowshipSchema = z.object({
    // System created fields
    id: CommonSchemas.id,
    ...CommonSchemas.systemDates,

    // Required fields
    churchId: CommonSchemas.id,
    name: CommonSchemas.name,

    // Optional fields
    notes: z.string().nullable().optional(),
    chairmanId: CommonSchemas.id.nullable().optional(),
    deputyChairmanId: CommonSchemas.id.nullable().optional(),
    secretaryId: CommonSchemas.id.nullable().optional(),
    treasurerId: CommonSchemas.id.nullable().optional(),

    // Related entities (populated via eager loading)
    chairman: z.lazy((): z.ZodType => MemberSchemas.memberSchema.nullable().optional()),
    deputyChairman: z.lazy((): z.ZodType => MemberSchemas.memberSchema.nullable().optional()),
    secretary: z.lazy((): z.ZodType => MemberSchemas.memberSchema.nullable().optional()),
    treasurer: z.lazy((): z.ZodType => MemberSchemas.memberSchema.nullable().optional()),
    memberCount: z.number().optional(),
});

// Schema for creating a new fellowship
const createFellowshipSchema = fellowshipSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
    chairman: true,
    deputyChairman: true,
    secretary: true,
    treasurer: true,
    memberCount: true,
});

// Schema for updating an existing fellowship
const updateFellowshipSchema = fellowshipSchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
    chairman: true,
    deputyChairman: true,
    secretary: true,
    treasurer: true,
    memberCount: true,
}).partial();

// Define query parameters for getAll
const fellowshipQueryParamsSchema = z.object({
    eager: z.string().default("chairman,deputyChairman,secretary,treasurer").optional(),
    rangeStart: z.coerce.number().optional().default(0),
    rangeEnd: z.coerce.number().optional().default(9),
    search: z.string().optional(),
    includeMemberCount: z.coerce.boolean().default(false).optional(),
});

export const FellowshipSchemas = {
    fellowshipSchema: fellowshipSchema,
    createFellowshipSchema: createFellowshipSchema,
    updateFellowshipSchema: updateFellowshipSchema,
    queryParamsSchema: fellowshipQueryParamsSchema,
    paginatedListResult: CommonSchemas.createPaginatedResponseSchema(
        fellowshipSchema,
    ),
};

export type FellowshipDTO = z.infer<typeof fellowshipSchema>;
export type CreateFellowshipDTO = z.infer<typeof createFellowshipSchema>;
export type UpdateFellowshipDTO = z.infer<typeof updateFellowshipSchema>;
export type FellowshipQueryParams = z.infer<typeof fellowshipQueryParamsSchema>;