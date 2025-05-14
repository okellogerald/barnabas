import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CommonSchemas } from "@/data/shared";
import { RoleSchemas } from "../role/role.schema";

const c = initContract();

export const roleContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        query: RoleSchemas.queryParamsSchema,
        responses: {
            200: RoleSchemas.paginatedListResult,
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all roles with filtering and pagination",
    },

    getById: {
        method: "GET",
        path: "/:id",
        query: z.object({
            eager: z.string().optional().default("permissions"),
        }),
        responses: {
            200: RoleSchemas.roleSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get role by ID",
    },

    create: {
        method: "POST",
        path: "",
        responses: {
            201: RoleSchemas.roleSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: RoleSchemas.createRoleSchema,
        summary: "Create new role",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: RoleSchemas.roleSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: RoleSchemas.updateRoleSchema,
        summary: "Update role",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: RoleSchemas.roleSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete role",
    },

    assignPermissions: {
        method: "POST",
        path: "/:id/permissions",
        responses: {
            200: RoleSchemas.roleSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: z.object({
            permissions: z.array(z.string()),
        }),
        summary: "Assign permissions to a role",
    },

    getAllPermissions: {
        method: "GET",
        path: "/permissions",
        responses: {
            200: z.array(z.object({
                id: CommonSchemas.id,
                name: z.string(),
                category: z.string().optional(),
                description: z.string().nullable().optional(),
            })),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all available permissions",
    },
});
