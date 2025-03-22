import { z } from "zod";
import { CommonSchemas } from "../_common";

// Church schema
export const churchSchema = z.object({
    id: CommonSchemas.id,
    name: z.string().min(1, "Church name is required"),
    domainName: z.string().min(1, "Domain name is required"),
    registrationNumber: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string().email("Must be a valid email address"),
    ...CommonSchemas.systemDates,
});

export type ChurchDTO = z.infer<typeof churchSchema>;
