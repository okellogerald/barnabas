import { z } from "zod";
import { CommonSchemas } from "@/data/shared";

// Base role schema
const roleSchema = z.object({
  // System created fields
  id: CommonSchemas.id,
  ...CommonSchemas.systemDates,

  // Church relationship
  churchId: CommonSchemas.id,

  // Role details
  name: z.string().min(2).max(50),
  description: z.string().nullable().optional(),

  // Transient properties for permissions (not stored directly in the role table)
  permissions: z.array(z.string()).optional(),
});

// Schema for creating a new role
const createRoleSchema = roleSchema.omit({
  id: true,
  churchId: true, // Will be added from the authenticated user's context
  createdAt: true,
  updatedAt: true,
}).extend({
  // Allow setting permissions during creation
  permissions: z.array(z.string()).optional(),
});

// Schema for updating an existing role
const updateRoleSchema = roleSchema.omit({
  id: true,
  churchId: true,
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  // Allow updating permissions
  permissions: z.array(z.string()).optional(),
});

// Define query parameters for getAll
const roleQueryParamsSchema = z.object({
  eager: z.string().default("permissions").optional(),
  rangeStart: z.coerce.number().default(0).optional(),
  rangeEnd: z.coerce.number().default(9).optional(),
  name: z.string().optional(),
  isSystem: z.coerce.boolean().optional(),
});

export const RoleSchemas = {
  roleSchema,
  createRoleSchema,
  updateRoleSchema,
  queryParamsSchema: roleQueryParamsSchema,
  paginatedListResult: CommonSchemas.createPaginatedResponseSchema(
    roleSchema,
  ),
};

export type RoleDTO = z.infer<typeof roleSchema>;
export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;
export type RoleQueryParams = z.infer<typeof roleQueryParamsSchema>;