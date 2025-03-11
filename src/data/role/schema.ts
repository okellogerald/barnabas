import { z } from 'zod';
import { idSchema, timestampFields } from '@/data/_common';

// Role schema
export const roleSchema = z.object({
  id: idSchema,
  name: z.string().min(1, "Role name is required"),
  churchId: idSchema,
  description: z.string().nullable(),
  ...timestampFields
});

export type RoleDTO = z.infer<typeof roleSchema>;