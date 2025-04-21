import { UseQueryResult } from "@tanstack/react-query";
import { AsyncState, StateFactory } from "./async_state";

// ApiError interface (assumed to be defined elsewhere in your application)
interface ApiError extends Error {
    statusCode: number;
}

/**
 * Maps a React Query result to our enhanced AsyncState
 */
export function mapQueryToAsyncState<T>(
    queryResult: UseQueryResult<T, unknown>,
    options?: {
        loadingMessage?: string;
        localData?: T;
        resourceType?: string;
        resourceId?: string;
        onSuccess?: (data: T) => AsyncState<T>;
        customErrorMapping?: (error: any) => AsyncState<T> | null;
    },
): AsyncState<T> {
    const {
        isLoading,
        isError,
        error,
        data,
        isSuccess,
        isRefetching,
        refetch,
    } = queryResult;

    const {
        loadingMessage = "Loading...",
        localData,
        resourceType = "Resource",
        resourceId,
        onSuccess,
        customErrorMapping,
    } = options || {};

    // Handle refetching with existing data
    if (isRefetching && localData) {
        return StateFactory.success({
            data: localData,
            actions: {
                refresh: refetch,
            },
        });
    }

    // Handle loading state
    if (isLoading || (isRefetching && !localData)) {
        return StateFactory.loading({ message: loadingMessage });
    }

    // Handle error state with custom handling
    if (isError) {
        // Allow custom error mapping first
        if (customErrorMapping) {
            const customState = customErrorMapping(error);
            if (customState) return customState;
        }

        // Handle ApiError with status codes
        if (error && typeof error === "object" && "statusCode" in error) {
            const apiError = error as ApiError;

            // Handle authentication error (401)
            if (apiError.statusCode === 401) {
                return StateFactory.unauthenticated({
                    message: apiError.message || "Authentication required",
                    actions: {
                        login: () => window.location.href = "/login",
                        retry: refetch,
                    },
                });
            }

            // Handle authorization error (403)
            if (apiError.statusCode === 403) {
                return StateFactory.unauthorized({
                    message: apiError.message ||
                        "You don't have permission to access this resource",
                    requiredPermissions: [],
                    actions: {
                        goBack: () => window.history.back(),
                        retry: refetch,
                    },
                });
            }

            // Handle not found (404)
            if (apiError.statusCode === 404) {
                return StateFactory.notFound({
                    message: apiError.message || "Resource not found",
                    resourceType,
                    resourceId,
                    actions: {
                        goBack: () => window.history.back(),
                        retry: refetch,
                    },
                });
            }
        }

        // Handle generic errors
        const _error = error instanceof Error
            ? error
            : new Error(String(error));
        return StateFactory.error({
            error: _error,
            actions: {
                retry: refetch,
            },
        });
    }

    // Handle null/undefined data as not found
    if (isSuccess && (data === null || data === undefined)) {
        return StateFactory.notFound({
            message: "Resource not found",
            resourceType,
            resourceId,
            actions: {
                goBack: () => window.history.back(),
                retry: refetch,
            },
        });
    }

    // Handle successful data
    if (isSuccess && data) {
        return onSuccess ? onSuccess(data) : StateFactory.success({
            data,
            actions: {
                refresh: refetch,
            },
        });
    }

    // Default to idle state
    return StateFactory.idle();
}
