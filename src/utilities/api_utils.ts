import { notifyUtils } from "./notification_utils";

/**
 * Utility for handling API errors
 */
export const apiErrorHandler = {
    /**
     * Process an error and return a user-friendly message
     * @param error The error to process
     * @returns A user-friendly error message
     */
    getErrorMessage(error: unknown): string {
        // Handle fetch Response errors
        if (
            error instanceof Response ||
            (error && typeof error === "object" && "status" in error)
        ) {
            const response = error as Response;

            // Handle by status code
            switch (response.status) {
                case 400:
                    return "Bad request. Please check your input.";
                case 401:
                    return "Authentication required. Please log in again.";
                case 403:
                    return "You do not have permission to perform this action.";
                case 404:
                    return "The requested resource was not found.";
                case 409:
                    return "Conflict with current state. Please refresh and try again.";
                case 500:
                    return "Server error. Please try again later.";
                default:
                    return `Request failed with status ${response.status}.`;
            }
        }

        // Handle structured API error responses
        if (error && typeof error === "object") {
            const errorObj = error as any;

            if (errorObj.message) {
                // Handle string message
                if (typeof errorObj.message === "string") {
                    return errorObj.message;
                }

                // Handle array of messages
                if (Array.isArray(errorObj.message)) {
                    return errorObj.message.join(", ");
                }

                // Handle record of field errors
                if (typeof errorObj.message === "object") {
                    return Object.entries(errorObj.message)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(", ");
                }
            }

            if (errorObj.error) {
                return errorObj.error;
            }
        }

        // String error
        if (typeof error === "string") {
            return error;
        }

        // Error object
        if (error instanceof Error) {
            return error.message;
        }

        // Network error
        if (error instanceof TypeError && error.message.includes("network")) {
            return "Network error. Please check your connection.";
        }

        // Unknown error
        return "An unexpected error occurred.";
    },

    /**
     * Handle an API error by extracting a message and showing a notification
     * @param error The error to handle
     * @param defaultMessage Optional default message to show if error processing fails
     */
    handleError(error: unknown, defaultMessage?: string): void {
        try {
            const message = this.getErrorMessage(error);
            notifyUtils.error("Operation Failed", message);
        } catch (e) {
            notifyUtils.error(
                "Operation Failed",
                defaultMessage || "An unexpected error occurred",
            );
            console.error("Error handling API error:", e);
        }
    },
};

/**
 * Common API response types
 */
export interface ApiResponse<T> {
    data: T;
    status: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

/**
 * Default fetch options for API requests
 */
export const defaultFetchOptions: RequestInit = {
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    credentials: "include",
};

/**
 * Utility functions for working with the Fetch API
 */
export const fetchUtils = {
    /**
     * Performs a GET request
     * @param url The URL to fetch
     * @param options Additional fetch options
     * @returns Promise with the parsed response
     */
    async get<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: "GET",
            ...options,
        });

        if (!response.ok) {
            throw response;
        }

        return response.json();
    },

    /**
     * Performs a POST request
     * @param url The URL to fetch
     * @param data Data to send
     * @param options Additional fetch options
     * @returns Promise with the parsed response
     */
    async post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: "POST",
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            throw response;
        }

        return response.json();
    },

    /**
     * Performs a PUT request
     * @param url The URL to fetch
     * @param data Data to send
     * @param options Additional fetch options
     * @returns Promise with the parsed response
     */
    async put<T>(url: string, data: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: "PUT",
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            throw response;
        }

        return response.json();
    },

    /**
     * Performs a PATCH request
     * @param url The URL to fetch
     * @param data Data to send
     * @param options Additional fetch options
     * @returns Promise with the parsed response
     */
    async patch<T>(url: string, data: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: "PATCH",
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            throw response;
        }

        return response.json();
    },

    /**
     * Performs a DELETE request
     * @param url The URL to fetch
     * @param options Additional fetch options
     * @returns Promise with the parsed response
     */
    async delete<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: "DELETE",
            ...options,
        });

        if (!response.ok) {
            throw response;
        }

        return response.json();
    },
};
