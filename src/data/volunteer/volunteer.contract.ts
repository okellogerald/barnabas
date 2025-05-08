import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { OpportunitySchemas } from "./volunteer.schema";
import { CommonSchemas } from "../_common";

const c = initContract();

export const opportunityContract = c.router({
    getAll: {
        method: "GET",
        path: "/",
        query: z.object({}),
        responses: {
            200: z.object({
                results: OpportunitySchemas.opportunityArray,
                total: z.number(),
            }),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all volunteer opportunities",
    },

    getById: {
        method: "GET",
        path: "/:id",
        responses: {
            200: OpportunitySchemas.opportunity,
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
            201: OpportunitySchemas.opportunity,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: OpportunitySchemas.createOpportunity,
        summary: "Create new volunteer opportunity",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: OpportunitySchemas.opportunity,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: OpportunitySchemas.updateOpportunity,
        summary: "Update volunteer opportunity",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: OpportunitySchemas.opportunity,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete volunteer opportunity",
    },
});
