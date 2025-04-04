import { z } from "zod";
import { CommonSchemas } from "@/data/_common";
import { roleSchema } from "../role";

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
  
  // Related entities that might be included with eager loading
  role: roleSchema.nullable().optional(),
});

// Schema for creating a new user
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  isDeleted: true,
}).extend({
  password: z.string().min(6),
});

// Schema for updating an existing user
export const updateUserSchema = userSchema.omit({
  id: true,
  churchId: true,
  email: true, // Email typically shouldn't be changed in an update
  createdAt: true,
  updatedAt: true,
  role: true,
  isDeleted: true,
}).partial().extend({
  password: z.string().min(6).optional(),
});

// Define query parameters for getAll
export const userQueryParamsSchema = z.object({
  eager: z.string().default("role").optional(),
  rangeStart: z.coerce.number().optional().default(0),
  rangeEnd: z.coerce.number().optional().default(9),
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
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