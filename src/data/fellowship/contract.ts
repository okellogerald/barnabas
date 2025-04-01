import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { FellowshipSchemas } from "./schema";
import { CommonSchemas } from "@/data/_common";

const c = initContract();

export const fellowshipContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        query: FellowshipSchemas.queryParamsSchema,
        responses: {
            200: FellowshipSchemas.paginatedListResult,
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all fellowships with filtering and pagination",
    },

    getById: {
        method: "GET",
        path: "/:id",
        query: z.object({
            eager: z.string().optional().default(
                "chairman,deputyChairman,secretary,treasurer",
            ),
        }),
        responses: {
            200: FellowshipSchemas.fellowshipSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get fellowship by ID",
    },

    create: {
        method: "POST",
        path: "",
        responses: {
            201: FellowshipSchemas.fellowshipSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: FellowshipSchemas.createFellowshipSchema,
        summary: "Create new fellowship",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: FellowshipSchemas.fellowshipSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: FellowshipSchemas.updateFellowshipSchema,
        summary: "Update fellowship",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: FellowshipSchemas.fellowshipSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete fellowship",
    },
});