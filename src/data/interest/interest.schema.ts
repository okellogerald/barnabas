import { z } from "zod";
import { CommonSchemas } from "../_common";
import { schemaFactory } from "@/factories";

// Lazy getter
const getMemberSchema = () => schemaFactory.getMemberSchema();
const getVolunteerSchema = () => schemaFactory.getVolunteerOpportunitySchema();

// Interest schema representing volunteer interests of members
const interestSchema = z.object({
    id: CommonSchemas.id,
    churchId: CommonSchemas.id,
    memberId: CommonSchemas.id,
    opportunityId: CommonSchemas.id,
    member: z.lazy(getMemberSchema).optional(),
    opportunity: z.lazy(getVolunteerSchema).optional(),
    ...CommonSchemas.systemDates,
});

// Schema for creating a new interest
const createInterestSchema = z.object({
    memberId: CommonSchemas.id,
    opportunityId: CommonSchemas.id,
});

export const InterestSchemas = {
    interestSchema,
    createInterestSchema,
};

// Export types
export type InterestDTO = z.infer<typeof interestSchema>;
export type CreateInterestDTO = z.infer<typeof createInterestSchema>;
