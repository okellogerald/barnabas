import { notifyUtils } from "../../utilities/notification.utils";
import { ApiError } from "./error.api";
import { PermissionError } from "./error.permission";
import { ErrorCategory, ErrorContext } from "./types";

/**
 * Handles API errors with consistent messaging, logging, and user notifications.
 * This function converts various error types into a standardized ApiError instance,
 * providing detailed logging and user-friendly messages.
 *
 * @param error The error object (can be any type).
 * @param category The category of the error.
 * @param context Additional context information.
 * @returns An ApiError instance representing the handled error.
 */
export const handleApiError = (
    error: any,
    category: ErrorCategory,
    context: ErrorContext = {},
): ApiError => {
    // If it's already an ApiError, just return it
    if (ApiError.is(error)) {
        return error;
    }

    // Special handling for permission errors
    if (PermissionError.is(error)) {
        const apiError = new ApiError(
            error.message,
            ErrorCategory.PERMISSION,
            error,
            { ...context },
        );

        // Log and notify
        console.error(`Permission error:`, {
            message: apiError.getUserFriendlyMessage(),
            requiredPermissions: error.requiredPermissions,
            context,
        });

        notifyUtils.error(apiError.getUserFriendlyMessage());
        return apiError;
    }

    // Create ApiError instance for other error types
    const apiError = new ApiError(
        "", // Empty message to use the generated one
        category,
        error,
        context,
    );

    // Log the error with full context for debugging
    console.error(`API error (${category}):`, {
        message: apiError.getUserFriendlyMessage(),
        status: apiError.status,
        context: apiError.context,
        originalError: error,
    });

    // Show user-friendly notification
    notifyUtils.error(apiError.getUserFriendlyMessage());

    return apiError;
};
