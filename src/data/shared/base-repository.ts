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
    constructor(endpoint: string, contract: TContract, args?: {
        root?: string;
    }) {
        this.contract = contract;
        this.endpoint = endpoint;
        this.root = args?.root;
    }

    /**
     * Gets the initialized client for making API requests.
     * Uses authentication token if available.
     */
    get client() {
        // Ensure that both `this.root` and `AppConfig.API_BASE_URL` don't end with a '/'
        const baseUrl = this.root
            ? `${this.root.replace(/\/$/, "")}/${this.endpoint}` // Remove trailing slash from `this.root` and append the endpoint
            : `${AppConfig.API_BASE_URL.replace(/\/$/, "")}/${this.endpoint}`; // Remove trailing slash from `AppConfig.API_BASE_URL` and append the endpoint

        // Get token from auth manager
        // const token = AuthenticationManager.instance.getToken() || "";
        const token = useAuthStore.getState().token || "";

        const args: InitClientArgs = {
            baseUrl,
            baseHeaders: {
                "Authorization": token ? `Bearer ${token}` : "",
                "x-request-id": uuidv4(),
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
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
    handleResponse<T>(
        result: { status: number; body: unknown },
        successStatusCode: number,
    ): T {
        if (successStatusCode === result.status) {
            return result.body as T;
        }

        // Extract error message from response body
        const errorMessage = this.extractErrorMessage(result.body);

        // Throw ApiError with status code and message
        throw new ApiError(
            errorMessage || this.getDefaultErrorMessage(result.status),
            undefined,
            result.body,
        );
    }

    /**
     * Extracts error message from response body
     */
    private extractErrorMessage(errorBody: unknown): string | undefined {
        if (!errorBody) return undefined;

        if (typeof errorBody === "string") return errorBody;

        if (typeof errorBody === "object" && errorBody !== null) {
            const error = errorBody as any;

            if (typeof error.message === "string") return error.message;

            if (Array.isArray(error.message)) return error.message.join(", ");

            if (typeof error.message === "object") {
                return Object.entries(error.message)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(", ");
            }
        }

        return undefined;
    }

    /**
     * Gets default error message based on status code
     */
    private getDefaultErrorMessage(statusCode: number): string {
        switch (statusCode) {
            case 400:
                return "Invalid request data";
            case 401:
                return "Authentication required";
            case 403:
                return "You do not have permission to perform this action";
            case 404:
                return "The requested resource was not found";
            case 429:
                return "Too many requests. Please try again later";
            case 500:
                return "Server error. Please try again later";
            default:
                return `Error ${statusCode}: An unexpected error occurred`;
        }
    }
}
