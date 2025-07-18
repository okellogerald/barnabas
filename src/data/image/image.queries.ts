import { useMutation } from "@tanstack/react-query";
import { UseMutationResult } from "@tanstack/react-query";
import { ImageManager } from "./image.manager";
import { ImageUploadResponseDTO } from "./schema";

// Create a manager instance
const imageManager = ImageManager.instance;

/**
 * Image query hooks for data fetching and mutations
 */
export const ImageQueries = {
  /**
   * Hook for uploading an image file
   */
  useUpload: (props?: {
    onSuccess?: (result: ImageUploadResponseDTO) => void;
    onError?: (error: Error) => void;
  }): UseMutationResult<ImageUploadResponseDTO, Error, File, unknown> =>
    useMutation({
      mutationFn: async (file: File) => {
        return await imageManager.uploadImage(file);
      },
      onSuccess: (result) => {
        // Call the onSuccess callback if provided
        if (props?.onSuccess) {
          props.onSuccess(result);
        }
      },
      onError: (error) => {
        // Call the onError callback if provided
        if (props?.onError) {
          props.onError(error);
        }
      },
    }),
};

/**
 * Image utility functions that don't require React Query
 */
export const ImageUtils = {
  /**
   * Get the full URL for an image filename
   */
  getImageUrl: (filename: string): string => {
    return imageManager.getImageUrl(filename);
  },

  /**
   * Check if a filename is a valid image filename
   */
  isValidImageFilename: (filename?: string | null): boolean => {
    return imageManager.isValidImageFilename(filename);
  },

  /**
   * Create a preview URL for a file
   */
  createPreviewUrl: (file: File): string => {
    return imageManager.createPreviewUrl(file);
  },

  /**
   * Revoke a preview URL
   */
  revokePreviewUrl: (url: string): void => {
    imageManager.revokePreviewUrl(url);
  },
};
