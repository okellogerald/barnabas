import { z } from "zod";
import { idSchema, timestampFields } from "@/data/_common";

// Fellowship schema
export const fellowshipSchema = z.object({
    id: idSchema,
    churchId: idSchema,
    name: z.string().min(1, "Fellowship name is required"),
    notes: z.string().nullable(),
    chairmanId: idSchema.nullable(),
    deputyChairmanId: idSchema.nullable(),
    secretaryId: idSchema.nullable(),
    treasurerId: idSchema.nullable(),
    ...timestampFields,
});

export type FellowshipDTO = z.infer<typeof fellowshipSchema>;

// Schema for creating a new fellowship
export const createFellowshipSchema = fellowshipSchema.omit({
    id: true,
    churchId: true,
    chairmanId: true,
    deputyChairmanId: true,
    secretaryId: true,
    treasurerId: true,
    createdAt: true,
    updatedAt: true,
});

export type CreateFellowshipDTO = z.infer<typeof createFellowshipSchema>;

// Schema for updating an existing fellowship
export const updateFellowshipSchema = fellowshipSchema
    .omit({ id: true, churchId: true, createdAt: true, updatedAt: true })
    .partial();

export type UpdateFellowshipDTO = z.infer<typeof updateFellowshipSchema>;
