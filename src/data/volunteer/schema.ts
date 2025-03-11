import { z } from "zod";
import { idSchema, timestampFields } from "@/data/_common";

// Volunteer Opportunity schema
export const opportunitySchema = z.object({
    id: idSchema,
    churchId: idSchema,
    name: z.string().min(1, "Opportunity name is required"),
    description: z.string().nullable(),
    ...timestampFields,
});

export type OpportunityDTO = z.infer<typeof opportunitySchema>;

// Schema for creating a new opportunity
export const createOpportunitySchema = opportunitySchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
});

export type CreateOpportunityDTO = z.infer<typeof createOpportunitySchema>;

// Schema for updating an existing opportunity
export const updateOpportunitySchema = createOpportunitySchema.partial();

export type UpdateOpportunityDTO = z.infer<typeof updateOpportunitySchema>;
