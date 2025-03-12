import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    createOpportunitySchema,
    opportunitySchema,
    updateOpportunitySchema,
} from "./schema";
import { badRequestErrorSchema } from "@/data/_common";

const c = initContract();

export const opportunityContract = c.router({
    getAll: {
        method: "GET",
        path: "/",
        responses: {
            200: z.array(opportunitySchema),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all volunteer opportunities",
    },

    getById: {
        method: "GET",
        path: "/:id",
        responses: {
            200: opportunitySchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get volunteer opportunity by ID",
    },

    create: {
        method: "POST",
        path: "/",
        responses: {
            201: opportunitySchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
        },
        body: createOpportunitySchema,
        summary: "Create new volunteer opportunity",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: opportunitySchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: updateOpportunitySchema,
        summary: "Update volunteer opportunity",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: opportunitySchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete volunteer opportunity",
    },
});
