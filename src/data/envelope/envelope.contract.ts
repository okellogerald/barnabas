import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  envelopeAssignmentSchema,
  envelopeBlockSchema,
  envelopeHistorySchema,
  envelopeSchema,
} from "./envelope.schema";

const c = initContract();

export const envelopeContract = c.router({
  // Get all envelopes with pagination
  getAll: {
    method: "GET",
    path: "/",
    responses: {
      200: z.object({
        results: z.array(envelopeSchema),
        total: z.number(),
      }),
      401: z.null(),
    },
    summary: "Get all envelopes with pagination",
    query: z.object({}),
  },

  // Get available envelopes
  getAvailable: {
    method: "GET",
    path: "/available",
    responses: {
      200: z.array(envelopeSchema),
      401: z.null(),
    },
    summary: "Get available envelopes",
  },

  // Get envelope by ID
  getById: {
    method: "GET",
    path: "/:id",
    responses: {
      200: envelopeSchema,
      404: z.null(),
      401: z.null(),
    },
    summary: "Get envelope by ID",
  },

  // Get envelope by number
  getByNumber: {
    method: "GET",
    path: "/number/:number",
    responses: {
      200: envelopeSchema,
      404: z.null(),
      401: z.null(),
    },
    summary: "Get envelope by number",
  },

  // Get envelope history
  getHistory: {
    method: "GET",
    path: "/:id/history",
    responses: {
      200: z.array(envelopeHistorySchema),
      404: z.null(),
      401: z.null(),
    },
    summary: "Get envelope history",
  },

  // Create envelope block
  createBlock: {
    method: "POST",
    path: "/",
    body: envelopeBlockSchema,
    responses: {
      201: z.object({
        count: z.number(),
        startNumber: z.number(),
        endNumber: z.number(),
      }),
      400: z.null(),
      401: z.null(),
    },
    summary: "Create envelope block",
  },

  // Delete envelope block
  deleteBlock: {
    method: "DELETE",
    path: "/",
    body: envelopeBlockSchema,
    responses: {
      200: z.object({
        count: z.number(),
        startNumber: z.number(),
        endNumber: z.number(),
      }),
      400: z.null(),
      401: z.null(),
    },
    summary: "Delete envelope block",
  },

  // Assign envelope
  assign: {
    method: "POST",
    path: "/:id/assign",
    body: envelopeAssignmentSchema,
    responses: {
      201: envelopeSchema,
      400: z.null(),
      404: z.null(),
      409: z.null(),
      401: z.null(),
    },
    summary: "Assign envelope to member",
  },

  // Release envelope
  release: {
    method: "POST",
    path: "/:id/release",
    body: z.object({}),
    responses: {
      201: envelopeSchema,
      404: z.null(),
      409: z.null(),
      401: z.null(),
    },
    summary: "Release envelope from member",
  },
});
