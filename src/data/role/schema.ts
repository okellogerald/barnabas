import { z } from 'zod';
import { CommonSchemas } from '../_common';

// Role schema
export const roleSchema = z.object({
  id: CommonSchemas.id,
  name: z.string().min(1, "Role name is required"),
  churchId: CommonSchemas.id,
  description: z.string().nullable(),
  ...CommonSchemas.systemDates
});

export type RoleDTO = z.infer<typeof roleSchema>;