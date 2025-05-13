import { z } from "zod";
import { CommonSchemas } from "@/data/shared";

// Base role schema
const roleActionSchema = z.object({
  // System created fields
  id: CommonSchemas.id,
  ...CommonSchemas.systemDates,

  roleId: z.string().min(2),
  action: z.string().min(2),
});

// Define query parameters for getAll
const roleActionQueryParamsSchema = z.object({
  // eager: z.string().default("role").optional(),
  rangeStart: z.coerce.number().default(0).optional(),
  rangeEnd: z.coerce.number().default(9).optional(),
  roleId: z.string().optional(),
});

export const RoleActionsSchemas = {
  roleSchema: roleActionSchema,
  queryParamsSchema: roleActionQueryParamsSchema,
  paginatedListResult: CommonSchemas.createPaginatedResponseSchema(
    roleActionSchema,
  ),
};

export type RoleActionDTO = z.infer<typeof roleActionSchema>;
export type RoleActionQueryParams = z.infer<typeof roleActionQueryParamsSchema>;
