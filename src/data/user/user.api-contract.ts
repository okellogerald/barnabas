import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserSchemas } from "./user.schema";
import { CommonSchemas } from "@/data/shared";

const c = initContract();

export const userContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        query: UserSchemas.queryParamsSchema,
        responses: {
            200: UserSchemas.paginatedListResult,
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all users with filtering and pagination",
    },

    getById: {
        method: "GET",
        path: "/:id",
        query: z.object({
            eager: z.string().optional().default("role"),
        }),
        responses: {
            200: UserSchemas.userSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get user by ID",
    },

    create: {
        method: "POST",
        path: "",
        responses: {
            201: UserSchemas.userSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: UserSchemas.createUserSchema,
        summary: "Create new user",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: UserSchemas.userSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: UserSchemas.updateUserSchema,
        summary: "Update user",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: UserSchemas.userSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete user",
    },
});
