import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    createMemberSchema,
    memberQueryParamsSchema,
    memberSchema,
    updateMemberSchema,
} from "./schema";
import { badRequestErrorSchema } from "@/data/_common";

const c = initContract();

export const memberContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        query: memberQueryParamsSchema,
        responses: {
            200: z.object({
                results: z.array(memberSchema),
                total: z.number(),
            }),
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
            200: memberSchema,
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
            201: memberSchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
        },
        body: createMemberSchema,
        summary: "Create new member",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: memberSchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: updateMemberSchema,
        summary: "Update member",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: memberSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete member",
    },
});
