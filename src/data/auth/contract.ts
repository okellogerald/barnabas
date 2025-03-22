import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    authResponseSchema,
    currentUserResponseSchema,
    loginRequestSchema,
} from "./schema";
import { CommonSchemas } from "@/data/_common";

const c = initContract();

export const authContract = c.router({
    login: {
        method: "POST",
        path: "/login",
        responses: {
            201: authResponseSchema,
            400: CommonSchemas.badRequestError,
        },
        body: loginRequestSchema,
        summary: "User login",
    },

    getCurrentUser: {
        method: "GET",
        path: "/me",
        responses: {
            200: currentUserResponseSchema,
            401: z.null(),
        },
        summary: "Get current authenticated user",
    },

    logout: {
        method: "POST",
        path: "/logout",
        responses: {
            201: z.null(),
            401: z.null(),
        },
        body: null,
        summary: "User logout",
    },
});
