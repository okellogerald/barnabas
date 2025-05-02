import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { RoleActionsSchemas } from "./schema";

const c = initContract();

export const roleContract = c.router({
    getAll: {
        method: "GET",
        path: "/:roleId",
        query: RoleActionsSchemas.queryParamsSchema,
        responses: {
            200: RoleActionsSchemas.paginatedListResult,
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all roles with filtering and pagination",
    },

    getById: {
        method: "GET",
        path: "/:roleId/:actionId",
        query: z.object({
            eager: z.string().optional().default("permissions"),
        }),
        responses: {
            200: RoleActionsSchemas.roleSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get role by ID",
    },
});
