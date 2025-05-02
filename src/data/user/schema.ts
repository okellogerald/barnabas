import { z } from "zod";
import { CommonSchemas } from "@/data/_common";
import { churchSchema } from "../church";
import { RoleSchemas } from "../role";

// Base user schema
export const userSchema = z.object({
  id: CommonSchemas.id,
  ...CommonSchemas.systemDates,

  churchId: CommonSchemas.id,
  roleId: CommonSchemas.id,

  name: CommonSchemas.name,
  email: z.string().email(),
  phoneNumber: CommonSchemas.phoneNumber.nullable(),

  isActive: z.coerce.boolean().default(true),
  isDeleted: z.coerce.boolean().default(false),

  permissions: z.array(z.string()).optional(),

  // Related entities that might be included with eager loading
  role: RoleSchemas.roleSchema.nullable().optional(),
  church: churchSchema.nullable().optional(),
});

// Schema for creating a new user
export const createUserSchema = z.object({
  name: CommonSchemas.name,
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: CommonSchemas.phoneNumber.nullable(),
  roleId: CommonSchemas.id,
});

// Schema for updating an existing user
export const updateUserSchema = createUserSchema.partial();

// Define query parameters for getAll
export const userQueryParamsSchema = z.object({
  eager: z.string().default("role").optional(),
  rangeStart: z.coerce.number().optional(),
  rangeEnd: z.coerce.number().optional(),
  name: z.string().optional(),
  roleId: z.string().optional(),
  email: z.string().optional(),
  isActive: z.coerce.number().optional(),
});

export const UserSchemas = {
  userSchema,
  createUserSchema,
  updateUserSchema,
  queryParamsSchema: userQueryParamsSchema,
  paginatedListResult: CommonSchemas.createPaginatedResponseSchema(userSchema),
};

export type UserDTO = z.infer<typeof userSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserQueryParams = z.infer<typeof userQueryParamsSchema>;
