import { UseQueryResult } from "@tanstack/react-query";
import { AsyncState, AsyncStateFactory } from "./types";
import { ApiError } from "@/lib/error";

type StateDeterminationParams<T> = {
  queryResult: UseQueryResult<T, unknown>;
  localData?: {
    hasData: boolean;
    data: T;
  };
  loadingMessage?: string;
  errorMessage?: string;
  resourceType?: string;
  resourceId?: string;
  onAuthenticationError?: (error: Error) => AsyncState<T>;
  onAuthorizationError?: (error: Error) => AsyncState<T>;
  onNotFound?: (resourceType: string, resourceId?: string) => AsyncState<T>;
  onCustomSuccess?: (data: T) => AsyncState<T>;
};

/**
 * Determines the appropriate UI state based on query result
 */
export function determineQueryState<T>({
  queryResult,
  localData,
  loadingMessage,
  errorMessage,
  resourceType = "Resource",
  resourceId,
  onAuthenticationError,
  onAuthorizationError,
  onNotFound,
  onCustomSuccess,
}: StateDeterminationParams<T>): AsyncState<T> {
  const { data, error, isRefetching, refetch, isSuccess } = queryResult;

  // Handle refetching with existing data
  if (isRefetching && localData?.hasData) {
    return onCustomSuccess
      ? onCustomSuccess(localData.data)
      : AsyncStateFactory.success(localData.data, { refetch });
  }

  // Handle initial loading or refetching without data
  if (queryResult.isLoading || (isRefetching && !localData?.hasData)) {
    return AsyncStateFactory.loading(loadingMessage);
  }

  // Handle errors with ApiError status codes
  if (error) {
    // Handle ApiError with status codes
    if (error instanceof ApiError) {
      // Handle authentication error (401)
      if (error.status === 401) {
        return onAuthenticationError
          ? onAuthenticationError(error)
          : AsyncStateFactory.unauthenticated({
              message: error.message || "Authentication failed. Please log in again.",
              actions: { 
                retry: refetch,
                login: () => window.location.href = "/login"
              }
            });
      }
      
      // Handle authorization error (403)
      if (error.status === 403) {
        return onAuthorizationError
          ? onAuthorizationError(error)
          : AsyncStateFactory.unauthorized({
              message: error.message || "You don't have permission to perform this action.",
              actions: { retry: refetch }
            });
      }
      
      // Handle not found (404)
      if (error.status === 404) {
        return onNotFound
          ? onNotFound(resourceType, resourceId)
          : AsyncStateFactory.notFound({
              message: error.message || `The requested ${resourceType.toLowerCase()} was not found.`,
              resourceType,
              resourceId,
              actions: { retry: refetch }
            });
      }
      
      // Handle other API errors with status codes
      return AsyncStateFactory.error({
        error: error.message || errorMessage || "An error occurred",
        retry: refetch
      });
    }
    
    // Handle generic errors (not ApiError)
    const errorMsg = error instanceof Error ? error.message : String(error);
    return AsyncStateFactory.error({
      error: errorMsg || errorMessage || "An error occurred",
      retry: refetch
    });
  }

  // Handle null/undefined successful responses
  if (isSuccess && (data === null || data === undefined)) {
    return onNotFound
      ? onNotFound(resourceType, resourceId)
      : AsyncStateFactory.notFound({
          message: `The requested ${resourceType.toLowerCase()} could not be found.`,
          resourceType,
          resourceId,
          actions: { retry: refetch }
        });
  }

  // Handle successful data retrieval
  if (data) {
    return onCustomSuccess
      ? onCustomSuccess(data)
      : AsyncStateFactory.success(data, { refetch });
  }

  // Default to idle state if no conditions match
  return AsyncStateFactory.idle();
}