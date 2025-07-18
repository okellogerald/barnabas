import { z } from "zod";

/**
 * Schema for image upload response
 */
export const imageUploadResponseSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
});

/**
 * Schema for image upload validation
 */
export const imageUploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "Must be a valid file")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      "File size must be less than 5MB"
    )
    .refine((file) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      return allowedTypes.includes(file.type);
    }, "Only JPEG, PNG, GIF, and WebP images are allowed"),
});

// Export types
export type ImageUploadResponseDTO = z.infer<typeof imageUploadResponseSchema>;
export type ImageUploadValidation = z.infer<typeof imageUploadSchema>;
