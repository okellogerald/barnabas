import { z } from "zod";
import { idSchema, timestampFields } from "@/data/_common";

// Church schema
export const churchSchema = z.object({
    id: idSchema,
    name: z.string().min(1, "Church name is required"),
    domainName: z.string().min(1, "Domain name is required"),
    registrationNumber: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string().email("Must be a valid email address"),
    ...timestampFields,
});

export type ChurchDTO = z.infer<typeof churchSchema>;
