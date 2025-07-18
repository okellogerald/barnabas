import { BaseRepository } from "@/data/shared";
import { imageContract } from "./image.api-contract";
import { ImageUploadResponseDTO } from "./schema";
import { ApiError } from "@/lib/error";

export class ImageRepository extends BaseRepository<typeof imageContract> {
  constructor() {
    super("image", imageContract);
  }

  /**
   * Upload an image file
   * @param file - The image file to upload
   * @returns Promise with the uploaded image filename
   */
  async upload(file: File): Promise<ImageUploadResponseDTO> {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("image", file);

    const result = await this.multipartClient.upload({
      body: formData,
    });

    if (result.status === 413 || result.status === 400) {
      throw new ApiError(result.status, result.body.message);
    }

    return this.handleResponse<ImageUploadResponseDTO>(result, 200);
  }

  /**
   * Get the full URL for an image filename
   * @param filename - The image filename
   * @returns The full URL to access the image
   */
  getImageUrl(filename: string): string {
    // Return the full URL for accessing the image
    // This uses the public endpoint that doesn't require authentication
    return `${this.root}/image/${filename}`;
  }

  /**
   * Validate if a filename appears to be a valid image filename
   * @param filename - The filename to validate
   * @returns boolean indicating if the filename appears valid
   */
  isValidImageFilename(filename?: string | null): boolean {
    if (!filename) return false;

    // Check if filename has valid image extension
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const lowercaseFilename = filename.toLowerCase();

    return imageExtensions.some((ext) => lowercaseFilename.endsWith(ext));
  }
}
