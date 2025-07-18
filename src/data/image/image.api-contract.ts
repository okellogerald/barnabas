import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { imageUploadResponseSchema } from "./schema";

const c = initContract();

export const imageContract = c.router({
  // Upload image
  upload: {
    method: "POST",
    path: "/upload",
    contentType: "multipart/form-data",
    body: c.type<FormData>(), // FormData for file upload
    responses: {
      200: imageUploadResponseSchema,
      400: z.object({
        message: z.string(),
        error: z.string(),
        statusCode: z.number(),
      }),
      413: z.object({
        message: z.string(),
        error: z.string().nullish(),
        statusCode: z.number(),
      }),
      401: z.null(),
    },
    summary: "Upload an image file",
  },

  // Get image (public endpoint - for reference, though not used in client)
  getImage: {
    method: "GET",
    path: "/:filename",
    responses: {
      200: c.type<Blob>(), // Image blob
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Get image by filename",
  },
});
