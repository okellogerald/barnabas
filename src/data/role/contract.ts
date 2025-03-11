import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { roleSchema } from "./schema";

const c = initContract();

export const roleContract = c.router({
    getAll: {
        method: "GET",
        path: "/role",
        responses: {
            200: z.object({
                data: z.array(roleSchema),
            }),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all roles",
    },

    getById: {
        method: "GET",
        path: "/role/:id",
        responses: {
            200: roleSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get role by ID",
    },
});
