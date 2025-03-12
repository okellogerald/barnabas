import { type AppRouter, initClient } from "@ts-rest/core";
import { AuthManager } from "@/managers/auth/auth.manager";
import { v4 as uuidv4 } from "uuid";
import type { InitClientArgs } from "@ts-rest/core";
import { BadRequestError } from "@/data/_common";
import { AppConfig } from "@/app";

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
        const baseUrl = this.root
            ? `${this.root}/${this.endpoint}`
            : `${AppConfig.API_BASE_URL}${this.endpoint}`;

        // Get token from auth manager
        const token = AuthManager.instance.getToken() || "";

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

        // Handle different error status codes
        switch (result.status) {
            case 400:
                throw new Error(
                    this.formatErrorMessage(result.body as BadRequestError),
                );
            case 401:
                throw new Error("Authentication failed. Please log in again.");
            case 403:
                throw new Error(
                    "You don't have permission to perform this action.",
                );
            case 404:
                throw new Error("The requested resource was not found.");
            case 500:
                throw new Error("Server error. Please try again later.");
            default:
                throw new Error(
                    "An unexpected error occurred. Please try again.",
                );
        }
    }

    /**
     * Formats error messages from a BadRequestError object
     */
    private formatErrorMessage(error: BadRequestError): string {
        if (!error) return "Invalid request";

        // Handle string message
        if (typeof error.message === "string") {
            return error.message;
        }

        // Handle array of messages
        if (Array.isArray(error.message)) {
            return error.message.join(", ");
        }

        // Handle record of messages
        if (typeof error.message === "object") {
            return Object.entries(error.message)
                .map(([field, message]) => `${field}: ${message}`)
                .join(", ");
        }

        return "Invalid request";
    }
}
