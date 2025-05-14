import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { InterestSchemas } from "./interest.schema";

const c = initContract();

export const interestContract = c.router({
  // Get all volunteer interests with pagination and filtering
  getAll: {
    method: "GET",
    path: "/",
    responses: {
      200: z.object({
        results: z.array(InterestSchemas.interestSchema),
        total: z.number(),
      }),
      401: z.null(),
    },
    summary: "Get all volunteer interests with pagination and filtering",
    query: z.object({}),
  },

  // Get volunteer interest by ID
  getById: {
    method: "GET",
    path: "/:id",
    responses: {
      200: InterestSchemas.interestSchema,
      404: z.null(),
      401: z.null(),
    },
    summary: "Get volunteer interest by ID",
  },

  // Get volunteer interests by member ID
  getByMemberId: {
    method: "GET",
    path: "/member/:memberId",
    responses: {
      200: z.array(InterestSchemas.interestSchema),
      401: z.null(),
    },
    summary: "Get volunteer interests by member ID",
  },

  // Get volunteer interests by opportunity ID
  getByOpportunityId: {
    method: "GET",
    path: "/opportunity/:opportunityId",
    responses: {
      200: z.array(InterestSchemas.interestSchema),
      401: z.null(),
    },
    summary: "Get volunteer interests by opportunity ID",
  },

  // Create a volunteer interest
  create: {
    method: "POST",
    path: "/",
    body: InterestSchemas.createInterestSchema,
    responses: {
      201: InterestSchemas.interestSchema,
      400: z.null(),
      401: z.null(),
      409: z.null(),
    },
    summary: "Create a volunteer interest",
  },

  // Delete a volunteer interest
  delete: {
    method: "DELETE",
    path: "/:id",
    responses: {
      200: InterestSchemas.interestSchema,
      404: z.null(),
      401: z.null(),
    },
    summary: "Delete a volunteer interest",
  },
});