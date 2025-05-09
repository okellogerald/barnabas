import { z } from "zod";
import { CommonSchemas } from "@/data/_common";

// Volunteer Opportunity schema
const volunteerOpportunitySchema = z.object({
    id: CommonSchemas.id,
    ...CommonSchemas.systemDates,

    churchId: CommonSchemas.id,

    name: z.string().min(2),
    description: z.string().nullable(),
});

// Schema for creating a new opportunity
const createVolunteerOpportunitySchema = volunteerOpportunitySchema.omit({
    id: true,
    churchId: true,
    createdAt: true,
    updatedAt: true,
});

// Schema for updating an existing opportunity
const updateVolunteerOpportunitySchema = createVolunteerOpportunitySchema
    .partial();

export const VolunteerOpportunitySchemas = {
    volunteerOpportunity: volunteerOpportunitySchema,
    volunteerOpportunityArray: z.array(volunteerOpportunitySchema),
    createVolunteerOpportunity: createVolunteerOpportunitySchema,
    updateVolunteerOpportunity: updateVolunteerOpportunitySchema,
};

export type VolunteerOpportunityDTO = z.infer<
    typeof volunteerOpportunitySchema
>;
export type CreateVolunteerOpportunityDTO = z.infer<
    typeof createVolunteerOpportunitySchema
>;
export type UpdateVolunteerOpportunityDTO = z.infer<
    typeof updateVolunteerOpportunitySchema
>;
