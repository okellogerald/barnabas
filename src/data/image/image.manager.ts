import { ImageRepository } from "./image.repository";
import { ImageUploadResponseDTO } from "./schema";

/**
 * Image Manager
 *
 * Handles image-related operations, orchestrating data operations
 * from the repository and enforcing necessary permissions.
 * Implemented as a singleton.
 */
export class ImageManager {
  private static _instance: ImageManager;
  private _repo: ImageRepository;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor(repo: ImageRepository) {
    this._repo = repo;
  }

  /**
   * Gets the singleton instance of ImageManager.
   */
  public static get instance(): ImageManager {
    if (!ImageManager._instance) {
      ImageManager._instance = new ImageManager(new ImageRepository());
    }
    return ImageManager._instance;
  }

  /**
   * Uploads an image file to the server
   * @param file - The image file to upload
   * @returns Promise with the uploaded image filename
   */
  public async uploadImage(file: File): Promise<ImageUploadResponseDTO> {
    try {
      // Validate file before upload
      this.validateImageFile(file);

      const response = await this._repo.upload(file);
      return response;
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to upload image.");
    }
  }

  /**
   * Gets the full URL for accessing an uploaded image
   * @param filename - The image filename returned from upload
   * @returns The full URL to access the image
   */
  public getImageUrl(filename: string): string {
    return this._repo.getImageUrl(filename);
  }

  /**
   * Validates if a filename appears to be a valid image filename
   * @param filename - The filename to validate
   * @returns boolean indicating if the filename appears valid
   */
  public isValidImageFilename(filename?: string | null): boolean {
    return this._repo.isValidImageFilename(filename);
  }

  /**
   * Validates an image file before upload
   * @param file - The file to validate
   * @throws Error if validation fails
   */
  private validateImageFile(file: File): void {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB");
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    // Check if file exists
    if (!file || file.size === 0) {
      throw new Error("No file provided or file is empty");
    }
  }

  /**
   * Creates a preview URL for a file (for UI preview before upload)
   * @param file - The file to create a preview for
   * @returns A blob URL for previewing the image
   */
  public createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revokes a preview URL to free up memory
   * @param url - The blob URL to revoke
   */
  public revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
