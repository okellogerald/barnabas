import { PermissionError } from "@/utilities/errors";
import { UseQueryResult } from "@tanstack/react-query";

/**
 * Flexible state determination function
 * Handles complex state transitions based on query results and local data
 *
 * @template T The type of data being fetched
 * @template State The type of UI state to be returned
 * @param {StateDeterminationOptions<T, State>} options - Configuration options for state determination
 * @returns {State} The appropriate UI state based on current conditions
 *
 * @example
 * // Basic usage with a payouts query
 * const state = determineUIState({
 *   queryResult: useQuery(...),
 *   localData: {
 *     hasData: payouts.length > 0,
 *     data: payouts
 *   },
 *   onLoading: () => UIStateFactory.loading(),
 *   onError: (error) => UIStateFactory.error({
 *     retry: () => refetch(),
 *     message: 'Failed to load payouts'
 *   }),
 *   onSuccess: (data) => ({
 *     type: UI_STATE_TYPE.success,
 *     payouts: data
 *   })
 * });
 *
 * @example
 * // Advanced usage with custom state handling
 * const state = determineUIState({
 *   queryResult: useQuery(...),
 *   localData: {
 *     hasData: cachedUsers.length > 0,
 *     data: cachedUsers
 *   },
 *   onLoading: () => ({
 *     type: 'LOADING',
 *     message: 'Fetching users...'
 *   }),
 *   onError: (error) => ({
 *     type: 'ERROR',
 *     details: error,
 *     recoveryAction: () => refetch()
 *   }),
 *   onSuccess: (data) => ({
 *     type: 'SUCCESS',
 *     users: data,
 *     timestamp: new Date()
 *   }),
 * });
 */
export const determineUIState = <T, State>({
    queryResult,
    localData,
    onLoading,
    onError,
    onPermissionError,
    onSuccess,
}: StateDeterminationOptions<T, State>): State => {
    const { data, error, isRefetching } = queryResult;
    const hasLocalData = localData?.hasData || false;

    // Handle refetching scenarios with existing data
    if (isRefetching && hasLocalData) {
        return onSuccess(localData!.data);
    }

    // Handle initial loading state
    if (isRefetching && !hasLocalData) {
        return onLoading();
    }

    // Handle error scenarios
    if (error) {
        if (PermissionError.is(error) && onPermissionError) {
            return onPermissionError(error);
        }
        return onError(error);
    }

    // Handle successful data retrieval
    if (data) return onSuccess(data);

    // Default to loading state
    return onLoading();
};

// Configuration interface for state determination
interface StateDeterminationOptions<T, State> {
    queryResult: UseQueryResult<T, unknown>;
    localData?: {
        hasData: boolean;
        data: T;
    };
    onLoading: () => State;
    onError: (e: unknown) => State;
    onPermissionError?: (e: PermissionError) => State;
    onSuccess: (data: T) => State;
}
