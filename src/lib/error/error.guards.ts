import { ApiError } from "./error.api";
import { PermissionError } from "./error.permission";

// Helper type to safely access common error properties
interface ErrorWithResponse {
    status?: number;
    response?: {
        status?: number;
        data?: {
            statusCode?: number;
            message?: string | string[] | Record<string, string>;
            error?: string;
        };
    };
    message?: string;
}

/**
 * Safely extracts an error object from an unknown value.
 * This function handles cases where the input might not be a valid error object.
 *
 * @param error Any error value.
 * @returns A safely typed error object, or an empty object if the input is invalid.
 */
const extractErrorData = (error: unknown): ErrorWithResponse => {
    // If it's not even an object, return empty object
    if (!error || typeof error !== "object") {
        return {};
    }

    // Cast to our safer type
    return error as ErrorWithResponse;
};

/**
 * Retrieves the HTTP status code from various error object structures.
 * This function checks for the status code in different locations within the error object,
 * including direct properties and nested response data.
 *
 * @param error Any error value.
 * @returns The status code if found, undefined otherwise.
 */
const getErrorStatus = (error: unknown): number | undefined => {
    const errorData = extractErrorData(error);

    // Direct status property
    if (typeof errorData.status === "number") {
        return errorData.status;
    }

    // Status in response object
    if (errorData.response && typeof errorData.response.status === "number") {
        return errorData.response.status;
    }

    // Status in response.data object
    if (
        errorData.response?.data &&
        typeof errorData.response.data.statusCode === "number"
    ) {
        return errorData.response.data.statusCode;
    }

    return undefined;
};

/**
 * Type guard to determine if an error is a PermissionError.
 * This function checks if the error is an instance of the PermissionError class.
 *
 * @param error Any error value.
 * @returns True if the error is a PermissionError, false otherwise.
 */
export const isPermissionError = (error: unknown): error is PermissionError => {
    return PermissionError.is(error);
};

/**
 * Type guard to determine if an error is an ApiError.
 * This function checks if the error is an instance of the ApiError class.
 *
 * @param error Any error value.
 * @returns True if the error is an ApiError, false otherwise.
 */
export const isApiError = (error: unknown): error is ApiError => {
    return ApiError.is(error);
};

/**
 * Checks if the error is an authentication error (401).
 * This function checks for both ApiError category and HTTP status code.
 *
 * @param error Any error value.
 * @returns True if the error is an authentication error, false otherwise.
 */
export const isAuthError = (error: unknown): boolean => {
    if (isApiError(error)) {
        return error.category === "authentication" || error.status === 401;
    }

    return getErrorStatus(error) === 401;
};

/**
 * Checks if the error is a permission error (403).
 * This function checks for ApiError category, PermissionError instance, and HTTP status code.
 *
 * @param error Any error value.
 * @returns True if the error is a permission error, false otherwise.
 */
export const isPermissionStatusError = (error: unknown): boolean => {
    if (isApiError(error)) {
        return error.category === "permission" || error.status === 403;
    }

    if (isPermissionError(error)) {
        return true;
    }

    return getErrorStatus(error) === 403;
};

/**
 * Checks if the error is a not found error (404).
 * This function checks for ApiError category and HTTP status code.
 *
 * @param error Any error value.
 * @returns True if the error is a not found error, false otherwise.
 */
export const isNotFoundError = (error: unknown): boolean => {
    if (isApiError(error)) {
        return error.category === "not_found" || error.status === 404;
    }

    return getErrorStatus(error) === 404;
};

/**
 * Checks if the error is a validation error (400).
 * This function checks for ApiError category and HTTP status code.
 *
 * @param error Any error value.
 * @returns True if the error is a validation error, false otherwise.
 */
export const isValidationError = (error: unknown): boolean => {
    if (isApiError(error)) {
        return error.category === "validation" || error.status === 400;
    }

    return getErrorStatus(error) === 400;
};

/**
 * Checks if the error is a network error.
 * This function checks for ApiError category and specific error message.
 *
 * @param error Any error value.
 * @returns True if the error is a network error, false otherwise.
 */
export const isNetworkError = (error: unknown): boolean => {
    if (isApiError(error)) {
        return error.category === "network";
    }

    const errorData = extractErrorData(error);
    return errorData.message === "Network Error";
};
