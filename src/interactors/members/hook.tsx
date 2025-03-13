import { useQuery } from "@tanstack/react-query";
import { MemberListPageUIState } from "./types";
import { QueryKeys } from "../_queries/queries";
import { determineUIState, UIStateFactory } from "../_state";
import { useStore } from "zustand";
import { fetchInitialMembers, memberTableStore } from "./service";
import { createSuccessState } from "./ui_factory";

/**
 * Hook for managing the member list page
 * @param initialFilters Optional initial filters to apply
 * @returns UI state for the member list page
 */
export const useMemberList = (initialFilters = {}): MemberListPageUIState => {
    // Access the Zustand store
    const store = useStore(memberTableStore);

    // Fetch members data
    const query = useQuery({
        queryKey: [QueryKeys.members.all, initialFilters],
        queryFn: () => fetchInitialMembers(initialFilters),
    });

    // Determine the current UI state based on the query
    const uiState = determineUIState<typeof query.data, MemberListPageUIState>({
        queryResult: query,
        onLoading: () => UIStateFactory.loading(),
        onError: () => UIStateFactory.error({
            retry: query.refetch,
            message: query.error?.message,
        }),
        onSuccess: (result) => createSuccessState({
            initialFetchResult: result!,
            store
        }),
        onPermissionError: (error) => UIStateFactory.unauthorized({ error }),
    });

    return uiState;
};