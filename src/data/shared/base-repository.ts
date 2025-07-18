import { type AppRouter, initClient } from "@ts-rest/core";
import { v4 as uuidv4 } from "uuid";
import type { InitClientArgs } from "@ts-rest/core";
import { ApiError } from "@/lib/error/error.api";
import { AppConfig } from "@/app/config";
import { useAuthStore } from "@/hooks/auth";

/**
 * BaseRepository
 *
 * A generic base class to build repositories for interacting with the Church Management API.
 * This class initializes a "ts-rest" client using a specified "ts-rest" contract and provides
 * helper methods to handle API responses consistently.
 *
 * @template TContract - The API contract extending `AppRouter` from `ts-rest`.
 */
export class BaseRepository<TContract extends AppRouter> {
  /**
   * A "ts-rest" contract
   *
   * @protected
   */
  protected contract: TContract;

  /**
   * An API endpoint
   *
   * @protected
   */
  protected endpoint: string;

  /**
   * An API Root URL
   *
   * @protected
   */
  protected root: string | undefined;

  /**
   * Constructs a new instance of `BaseRepository`.
   *
   * @param endpoint - API endpoint
   * @param contract - The "ts-rest" contract
   * @param args - Optional constructor arguments
   * @param args.root - Optional API root URL
   * @param args.authManager - Optional auth manager instance to use
   */
  constructor(
    endpoint: string,
    contract: TContract,
    args?: {
      root?: string;
    }
  ) {
    this.contract = contract;
    this.endpoint = endpoint;
    this.root = args?.root;
  }

  /**
   * Gets the initialized client for making API requests.
   * Uses authentication token if available.
   */
  get client() {
    return this.getClient("application/json");
  }

  /**
   * Gets a client configured for multipart/form-data requests (file uploads)
   */
  get multipartClient() {
    return this.getClient("multipart/form-data");
  }

  /**
   * Gets a client with custom content type
   * @param contentType - The content type to use for requests
   */
  private getClient(contentType: string) {
    // Ensure that both `this.root` and `AppConfig.API_BASE_URL` don't end with a '/'
    const baseUrl = this.root
      ? `${this.root.replace(/\/$/, "")}/${this.endpoint}` // Remove trailing slash from `this.root` and append the endpoint
      : `${AppConfig.API_BASE_URL.replace(/\/$/, "")}/${this.endpoint}`; // Remove trailing slash from `AppConfig.API_BASE_URL` and append the endpoint

    // Get token from auth manager
    const token = useAuthStore.getState().token || "";

    const baseHeaders: Record<string, string> = {
      Authorization: token ? `Bearer ${token}` : "",
      "x-request-id": uuidv4(),
      Accept: "application/json",
    };

    // Only set Content-Type for non-multipart requests
    // For multipart, the browser will set it automatically with the boundary
    if (contentType !== "multipart/form-data") {
      baseHeaders["Content-Type"] = contentType;
    }

    const args: InitClientArgs = {
      baseUrl,
      baseHeaders,
    };

    return initClient(this.contract, args);
  }

  /**
   * Gets a client with completely custom headers
   * @param customHeaders - Custom headers to merge with base headers
   */
  protected getClientWithCustomHeaders(customHeaders: Record<string, string>) {
    const baseUrl = this.root
      ? `${this.root.replace(/\/$/, "")}/${this.endpoint}`
      : `${AppConfig.API_BASE_URL.replace(/\/$/, "")}/${this.endpoint}`;

    const token = useAuthStore.getState().token || "";

    const baseHeaders: Record<string, string> = {
      Authorization: token ? `Bearer ${token}` : "",
      "x-request-id": uuidv4(),
      Accept: "application/json",
    };

    // Merge custom headers with base headers
    const mergedHeaders = { ...baseHeaders, ...customHeaders };

    const args: InitClientArgs = {
      baseUrl,
      baseHeaders: mergedHeaders,
    };

    return initClient(this.contract, args);
  }

  /**
   * Handles the API response by checking the HTTP status code and returning the response body
   * for successful requests or throwing an appropriate error.
   *
   * @template T - The expected type of the successful response body.
   * @param result - The API response object containing the status code and response body.
   * @param successStatusCode - The expected HTTP status code indicating success (e.g., 200, 201).
   * @returns The response body typed as `T` if the status code matches the success criteria.
   * @throws Error - If the status code indicates a failure.
   */
  handleResponse<T>(result: { status: number; body: unknown }, successStatusCode: number): T {
    if (successStatusCode === result.status) {
      return result.body as T;
    }

    throw ApiError.from(result.body, result.status);
  }
}
