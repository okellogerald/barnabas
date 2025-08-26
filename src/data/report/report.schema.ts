import { z } from "zod";

// Member count schema
export const memberCountSchema = z.object({
  "members.count": z.number().int().nonnegative(),
});

// Member count by gender schema
export const memberCountByGenderSchema = z.object({
  "members.gender": z.enum(["Male", "Female"]),
  "members.count": z.number().int().nonnegative(),
});

// Fellowship count schema
export const fellowshipCountSchema = z.object({
  "fellowships.count": z.number().int().nonnegative(),
});

// Envelope count schema
export const envelopeCountSchema = z.object({
  "envelopes.count": z.number().int().nonnegative(),
});

// Dashboard statistics schema
export const dashboardStatsSchema = z.object({
  totalActiveMembers: z.number().int().nonnegative(),
  totalMaleMembers: z.number().int().nonnegative(),
  totalFemaleMembers: z.number().int().nonnegative(),
  totalActiveMembersLast6Months: z.number().int().nonnegative(),
  totalActiveFellowships: z.number().int().nonnegative(),
  availableEnvelopes: z.number().int().nonnegative(),
});

// Export types
export type MemberCountDTO = z.infer<typeof memberCountSchema>;
export type MemberCountByGenderDTO = z.infer<typeof memberCountByGenderSchema>;
export type FellowshipCountDTO = z.infer<typeof fellowshipCountSchema>;
export type EnvelopeCountDTO = z.infer<typeof envelopeCountSchema>;
export type DashboardStatsDTO = z.infer<typeof dashboardStatsSchema>;
