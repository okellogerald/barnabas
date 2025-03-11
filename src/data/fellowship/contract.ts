import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    createFellowshipSchema,
    fellowshipSchema,
    updateFellowshipSchema,
} from "./schema";
import { badRequestErrorSchema } from "@/data/_common";

const c = initContract();

export const fellowshipContract = c.router({
    getAll: {
        method: "GET",
        path: "/fellowship",
        responses: {
            200: z.array(fellowshipSchema),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all fellowships",
    },

    getById: {
        method: "GET",
        path: "/fellowship/:id",
        responses: {
            200: fellowshipSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        summary: "Get fellowship by ID",
    },

    create: {
        method: "POST",
        path: "/fellowship",
        responses: {
            201: fellowshipSchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
        },
        body: createFellowshipSchema,
        summary: "Create new fellowship",
    },

    update: {
        method: "PATCH",
        path: "/fellowship/:id",
        responses: {
            200: fellowshipSchema,
            400: badRequestErrorSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: updateFellowshipSchema,
        summary: "Update fellowship",
    },

    delete: {
        method: "DELETE",
        path: "/fellowship/:id",
        responses: {
            200: fellowshipSchema,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: null,
        summary: "Delete fellowship",
    },
});
