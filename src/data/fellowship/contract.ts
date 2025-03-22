import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    createFellowshipSchema,
    fellowshipSchema,
    updateFellowshipSchema,
} from "./schema";
import { CommonSchemas } from "../_common";

const c = initContract();

export const fellowshipContract = c.router({
    getAll: {
        method: "GET",
        path: "",
        responses: {
            200: z.array(fellowshipSchema),
            401: z.null(),
            403: z.null(),
        },
        summary: "Get all fellowships",
    },

    getById: {
        method: "GET",
        path: "/:id",
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
        path: "",
        responses: {
            201: fellowshipSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
        },
        body: createFellowshipSchema,
        summary: "Create new fellowship",
    },

    update: {
        method: "PATCH",
        path: "/:id",
        responses: {
            200: fellowshipSchema,
            400: CommonSchemas.badRequestError,
            401: z.null(),
            403: z.null(),
            404: z.null(),
        },
        body: updateFellowshipSchema,
        summary: "Update fellowship",
    },

    delete: {
        method: "DELETE",
        path: "/:id",
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
