import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MemberSchemas } from "./schema";
import { CommonSchemas } from "@/data/_common";

const c = initContract();

export const memberContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        query: MemberSchemas.queryParamsSchema,
        responses: {
            200: MemberSchemas.paginatedListResult,
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all members with filtering and pagination",
    },

    getById: {
        method: "GET",
        path: "/:id",
        query: z.object({
            eager: z.string().optional().default(
                "fellowship,interests,dependants",
            ),
        }),
        responses: {
            200: MemberSchemas.memberSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get member by ID",
    },

    create: {
        method: "POST",
        path: "",
        responses: {
            201: MemberSchemas.memberSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: MemberSchemas.createMemberSchema,
        summary: "Create new member",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: MemberSchemas.memberSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: MemberSchemas.updateMemberSchema,
        summary: "Update member",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: MemberSchemas.memberSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete member",
    },
});
