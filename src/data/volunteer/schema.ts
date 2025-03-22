import { z } from "zod";
import { CommonSchemas } from "@/data/_common";

// Volunteer Opportunity schema
const opportunitySchema = z.object({
    id: CommonSchemas.id,
    ...CommonSchemas.systemDates,

    churchId: CommonSchemas.id,

    name: z.string().min(2),
    description: z.string().nullable(),
});

// Schema for creating a new opportunity
const createOpportunitySchema = opportunitySchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
});

// Schema for updating an existing opportunity
const updateOpportunitySchema = createOpportunitySchema.partial();

export const OpportunitySchemas = {
    opportunity: opportunitySchema,
    opportunityArray: z.array(opportunitySchema),
    createOpportunity: createOpportunitySchema,
    updateOpportunity: updateOpportunitySchema,
};

export type OpportunityDTO = z.infer<typeof opportunitySchema>;
export type CreateOpportunityDTO = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityDTO = z.infer<typeof updateOpportunitySchema>;
