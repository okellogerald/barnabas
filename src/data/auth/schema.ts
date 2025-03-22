import { z } from "zod";
import { CommonSchemas } from "../_common";

// Login request schema
export const loginRequestSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// User schema
export const userSchema = z.object({
  id: CommonSchemas.id,
  ...CommonSchemas.systemDates,

  churchId: CommonSchemas.id,
  roleId: CommonSchemas.id,

  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),

  isActive: z.number(),
  isDeleted: z.number(),
});

export type UserDTO = z.infer<typeof userSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
  allowedActions: z.array(z.string()),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Current user response schema
export const currentUserResponseSchema = z.object({
  user: userSchema,
  allowedActions: z.array(z.string()),
});

export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
