import { UseMutationResult } from "@tanstack/react-query";

/**
 * State determination parameters for mutation results
 */
interface DetermineMutationStateParams<TData, TState> {
    mutationResult: UseMutationResult<TData, Error, any, any>;
    onLoading: () => TState;
    onError: (error: any) => TState;
    onSuccess: (data: TData) => TState;
}

/**
 * Determines UI state based on mutation result status
 */
export function determineMutationState<TData, TState>({
    mutationResult,
    onLoading,
    onError,
    onSuccess,
}: DetermineMutationStateParams<TData, TState>): TState {
    const { isPending, isError, isSuccess, error, data } = mutationResult;

    if (isPending) {
        return onLoading();
    }

    if (isError) {
        return onError(error);
    }

    if (isSuccess && data) {
        return onSuccess(data);
    }

    // Fallback to loading state if no conditions match
    return onLoading();
}
