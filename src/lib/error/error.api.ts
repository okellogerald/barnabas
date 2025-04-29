import { ErrorCategory, ErrorContext } from "./types";

/**
 * Custom API error class that extends the standard Error.
 * Provides structured information about API errors, including category, status, context, and original error details.
 */
export class ApiError extends Error {
    /** The category of the API error. */
    category: ErrorCategory;

    /** The HTTP status code associated with the error (if available). */
    status?: number;

    /** Additional context information about the error. */
    context: ErrorContext;

    /** The original error object that caused this ApiError. */
    originalError: any;

    /**
     * Constructs a new ApiError instance.
     *
     * @param message The error message.
     * @param category The category of the error (default: ErrorCategory.UNKNOWN).
     * @param originalError The original error object (optional).
     * @param context Additional context information (optional).
     */
    constructor(
        message: string,
        category: ErrorCategory = ErrorCategory.UNKNOWN,
        originalError?: any,
        context: ErrorContext = {},
    ) {
        super(message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ApiError.prototype);

        // Maintain proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        this.name = "ApiError";
        this.category = category;
        this.context = context;
        this.originalError = originalError;

        // Extract status from original error if available
        if (originalError?.response?.status) {
            this.status = originalError.response.status;
        } else if (originalError?.status) {
            this.status = originalError.status;
        }
    }

    /**
     * Gets a user-friendly message for this error, considering various error scenarios.
     *
     * @returns A user-friendly error message.
     */
    getUserFriendlyMessage(): string {
        const baseMessage = this.getBaseErrorMessage();

        // Use the message from constructor if meaningful
        if (this.message && this.message !== baseMessage) {
            return this.message;
        }

        return this.extractMessageFromOriginalError(baseMessage);
    }

    /**
     * Generates the base error message based on the error category and entity.
     *
     * @returns The base error message.
     */
    private getBaseErrorMessage(): string {
        const entity = this.context.entity ? ` ${this.context.entity}` : "";

        switch (this.category) {
            case ErrorCategory.FETCH:
                return `Failed to load ${entity} data`;
            case ErrorCategory.CREATE:
                return `Failed to create new ${entity}`;
            case ErrorCategory.UPDATE:
                return `Failed to update ${entity}`;
            case ErrorCategory.DELETE:
                return `Failed to delete ${entity}`;
            case ErrorCategory.AUTH:
                return "Authentication error";
            case ErrorCategory.PERMISSION:
                return "Permission denied";
            case ErrorCategory.VALIDATION:
                return `Invalid ${entity} data`;
            case ErrorCategory.NOT_FOUND:
                return `${entity || "Resource"} not found`;
            case ErrorCategory.NETWORK:
                return "Network connection error";
            default:
                return `An error occurred`;
        }
    }

    /**
     * Extracts a meaningful message from the original error, considering API-specific formats and network errors.
     *
     * @param baseMessage The base error message.
     * @returns The extracted or formatted error message.
     */
    private extractMessageFromOriginalError(baseMessage: string): string {
        const error = this.originalError;

        if (!error) return baseMessage;

        // Handle API-specific error formats from Church Membership Management API
        if (error?.response?.data) {
            const responseData = error.response.data;

            // Handle validation errors
            if (responseData.statusCode === 400) {
                if (
                    typeof responseData.message === "object" &&
                    !Array.isArray(responseData.message)
                ) {
                    // Handle object format: {"fieldName": "error message"}
                    const fieldErrors = Object.entries(responseData.message)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join("; ");
                    return `${baseMessage}: ${fieldErrors}`;
                } else if (Array.isArray(responseData.message)) {
                    // Handle array format: ["error1", "error2"]
                    return `${baseMessage}: ${responseData.message.join("; ")}`;
                }
            }

            // Handle other API errors with standard message field
            if (
                responseData.message && typeof responseData.message === "string"
            ) {
                return `${baseMessage}: ${responseData.message}`;
            }
        }

        // Handle network errors
        if (error?.message === "Network Error") {
            return "Unable to connect to the server. Please check your internet connection.";
        }

        // Return base message with error message if available
        return error?.message
            ? `${baseMessage}: ${error.message}`
            : baseMessage;
    }

    /**
     * Type guard to determine if an error is an ApiError instance.
     *
     * @param error Any error value.
     * @returns True if the error is an ApiError, false otherwise.
     */
    static is(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }
}
