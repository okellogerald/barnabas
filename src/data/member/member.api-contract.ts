import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MemberSchemas } from "./member.schema";
import { CommonSchemas } from "@/data/shared";

const c = initContract();

export const memberContract = c.router({
    getCount: {
        method: "GET",
        path: "",
        query: z.object({}),
        responses: {
            200: z.array(
                z.union([
                    z.object({ "count(*)": z.number() }),
                    z.object({}),
                ]),
            ),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all members with filtering and pagination",
    },
    getAll: {
        method: "GET",
        path: "",
        query: z.object({}),
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
