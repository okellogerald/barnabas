import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { memberCountSchema, memberCountByGenderSchema } from "./report.schema";

const c = initContract();

export const reportContract = c.router({
  // Get member count
  getMemberCount: {
    method: "GET",
    path: "/member/count",
    responses: {
      200: z.array(memberCountSchema),
      401: z.null(),
    },
    summary: "Get total count of active members",
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  },

  // Get member count by gender
  getMemberCountByGender: {
    method: "GET",
    path: "/member/count-by-gender",
    responses: {
      200: z.array(memberCountByGenderSchema),
      401: z.null(),
    },
    summary: "Get count of active members grouped by gender",
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  },
});
