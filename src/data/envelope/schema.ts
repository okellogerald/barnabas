import { z } from "zod";
import { CommonSchemas } from "../_common";
import { MemberSchemas } from "../member";

// Envelope Activity Type enum as Zod enum
export const envelopeActivityTypeSchema = z.enum([
  "ASSIGN",
  "RELEASE"
]);

// Envelope schema
export const envelopeSchema = z.object({
  id: CommonSchemas.id,
  envelopeNumber: z.number().int().positive("Envelope number must be positive"),
  churchId: CommonSchemas.id,
  memberId: CommonSchemas.id.nullable(),
  assignedAt: CommonSchemas.date.nullable(),
  releasedAt: CommonSchemas.date.nullable(),
  member: MemberSchemas.memberSchema.nullable(),
  ...CommonSchemas.systemDates,
});

// Envelope History schema
export const envelopeHistorySchema = z.object({
  id: CommonSchemas.id,
  envelopeId: CommonSchemas.id,
  churchId: CommonSchemas.id,
  memberId: CommonSchemas.id,
  activityType: envelopeActivityTypeSchema,
  activityAt: CommonSchemas.date,
  member: MemberSchemas.memberSchema.nullable(),
  ...CommonSchemas.systemDates,
});

// Schema for creating envelope blocks
export const envelopeBlockSchema = z.object({
  startNumber: z.number().int().positive("Start number must be positive"),
  endNumber: z.number().int().positive("End number must be positive"),
}).refine(data => data.endNumber > data.startNumber, {
  message: "End number must be greater than start number",
  path: ["endNumber"],
});

// Schema for assigning an envelope
export const envelopeAssignmentSchema = z.object({
  memberId: CommonSchemas.id,
});

// Query parameters for envelope listing
export const envelopeQueryParamsSchema = z.object({
  rangeStart: z.number().optional(),
  rangeEnd: z.number().optional(),
  eager: z.string().optional(),
  sort: z.array(z.string()).optional(),
  filter: z.record(z.any()).optional(),
  assigned: z.boolean().optional(),
  available: z.boolean().optional(),
  memberId: CommonSchemas.id.optional(),
  envelopeNumber: z.number().int().positive().optional(),
});

// Export types
export type EnvelopeDTO = z.infer<typeof envelopeSchema>;
export type EnvelopeHistoryDTO = z.infer<typeof envelopeHistorySchema>;
export type EnvelopeBlockDTO = z.infer<typeof envelopeBlockSchema>;
export type EnvelopeAssignmentDTO = z.infer<typeof envelopeAssignmentSchema>;
export type EnvelopeQueryParams = z.infer<typeof envelopeQueryParamsSchema>;
export type EnvelopeActivityType = z.infer<typeof envelopeActivityTypeSchema>;