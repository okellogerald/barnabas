import { UseQueryResult } from "@tanstack/react-query";
import { AsyncState, StateFactory } from "./async-state";

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

type ExtractResults<Q extends readonly UseQueryResult<any, unknown>[]> = {
    [K in keyof Q]: Q[K] extends UseQueryResult<infer D, any> ? D : never;
};

type NonNullableResults<Q extends readonly UseQueryResult<any, unknown>[]> = {
    [K in keyof Q]: Q[K] extends UseQueryResult<infer D, any> ? NonNullable<D>
        : never;
};

type InferAsyncStateFromSuccess<
    Q extends readonly UseQueryResult<any, unknown>[],
    F,
> = F extends (results: ExtractResults<Q>) => AsyncState<infer R> ? R : never;

/**
 * Maps multiple React Query results to our enhanced AsyncState
 */
export function mapQueriesToAsyncState<
    Q extends readonly UseQueryResult<any, unknown>[],
    F extends (results: NonNullableResults<Q>) => AsyncState<any>,
>(
    queries: Q,
    options: {
        loadingMessage?: string;
        localData?: InferAsyncStateFromSuccess<Q, F>;
        resourceType?: string;
        resourceId?: string;
        onSuccess: F;
        customErrorMapping?: (
            error: any,
        ) => AsyncState<InferAsyncStateFromSuccess<Q, F>> | null;
    },
): AsyncState<InferAsyncStateFromSuccess<Q, F>> {
    const isLoading = queries.some((q) => q.isLoading);
    const isError = queries.some((q) => q.isError);
    const isSuccess = queries.every((q) => q.isSuccess);
    const isRefetching = queries.some((q) => q.isRefetching);
    const error = queries.find((q) => q.error)?.error;

    // Result tuple with possible undefineds
    const rawResults = queries.map((q) => q.data) as ExtractResults<Q>;

    const refetchAll = () => queries.forEach((q) => q.refetch());

    const {
        loadingMessage = "Loading...",
        localData,
        resourceType = "Resource",
        resourceId,
        customErrorMapping,
    } = options || {};

    // Handle refetching with existing data
    if (isRefetching && localData) {
        return StateFactory.success({
            data: localData,
            actions: {
                refresh: refetchAll,
            },
        });
    }

    // Handle loading state
    if (isLoading || (isRefetching && !localData)) {
        return StateFactory.loading({ message: loadingMessage });
    }

    // Handle error state
    if (isError) {
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
                        retry: refetchAll,
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
                        retry: refetchAll,
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
                        retry: refetchAll,
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
                retry: refetchAll,
            },
        });
    }

    // Handle successful data
    // if (isSuccess) {
    //     if (options?.onSuccess) return options.onSuccess(results);
    //     if (results.length === 1) {
    //         return StateFactory.success({
    //             data: results[0],
    //             actions: { refresh: refetchAll },
    //         });
    //     }
    //     throw new Error(
    //         "Multiple queries require `onSuccess` to map the result properly.",
    //     );
    // }
    if (isSuccess) {
        // Runtime safety: cast is safe because isSuccess implies data is not undefined
        const safeResults = rawResults.map((r, i) => {
          if (r === undefined) {
            throw new Error(`Query ${i} returned undefined even though isSuccess is true`);
          }
          return r;
        }) as NonNullableResults<Q>;
    
        return options.onSuccess(safeResults);
      }

    // Default to idle state
    return StateFactory.idle();
}
