import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CommonSchemas } from "../shared";
import { schemaFactory } from "@/factories";

const c = initContract();

const getVolunteerSchema = () => schemaFactory.getVolunteerOpportunitySchema();
const getMemberSchema = () => schemaFactory.getMemberSchema();

export const volunteerOpportunityContract = c.router({
    // Get all opportunities with pagination
    getAll: {
        method: "GET",
        path: "/",
        responses: {
            200: z.array(z.lazy(getVolunteerSchema)),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all volunteer opportunities",
        query: z.object({}),
    },

    // Get all opportunities with pagination
    getPaginated: {
        method: "GET",
        path: "/",
        responses: {
            200: z.object({
                results: z.array(z.lazy(getVolunteerSchema)),
                total: z.number(),
            }),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all volunteer opportunities",
        query: z.object({}),
    },

    // Get opportunity by ID
    getById: {
        method: "GET",
        path: "/:id",
        responses: {
            200: z.lazy(getVolunteerSchema),
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get volunteer opportunity by ID",
    },

    // Create opportunity
    create: {
        method: "POST",
        path: "/",
        responses: {
            201: z.lazy(getVolunteerSchema),
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: z.lazy(getVolunteerSchema),
        summary: "Create new volunteer opportunity",
    },

    // Update opportunity
    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: z.lazy(getVolunteerSchema),
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: z.lazy(getVolunteerSchema),
        summary: "Update volunteer opportunity",
    },

    // Delete opportunity
    delete: {
        method: "DELETE",
        path: "/:id",
        responses: {
            200: z.lazy(getVolunteerSchema),
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete volunteer opportunity",
    },

    // Get interested members for an opportunity
    getInterestedMembers: {
        method: "GET",
        path: "/:id/members",
        responses: {
            200: z.array(z.lazy(getMemberSchema)),
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get members interested in this opportunity",
    },

    // Add member interest in an opportunity
    addInterest: {
        method: "POST",
        path: "/:id/members/:memberId",
        responses: {
            201: z.object({ id: z.string() }),
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
            409: z.null(),
        },
        body: z.object({}),
        summary: "Add member interest in an opportunity",
    },

    // Remove member interest in an opportunity
    removeInterest: {
        method: "DELETE",
        path: "/:id/members/:memberId",
        responses: {
            200: z.object({ success: z.boolean() }),
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Remove member interest in an opportunity",
    },
});
