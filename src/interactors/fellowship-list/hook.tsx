import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fellowshipService, FellowshipsQueryResult } from "./service";
import { fellowshipTableStore } from "./store.table";
import { fellowshipFilterStore } from "./store.filters";
import { useStore } from "zustand";
import { AsyncState, determineQueryState } from "@/interactors/_new_state";
import { QueryKeys } from "../_queries";
// Import the updated types
import { FellowshipListSuccessState } from "./types";
import { createFellowshipListSuccessState } from "./ui.factory";

/**
 * Hook to manage the state and logic for the Fellowship List page.
 * Fetches initial data, handles filters, pagination, and actions.
 *
 * @returns {AsyncState<FellowshipListSuccessState>} The current UI state of the fellowship list page.
 */
export const useFellowshipList = (): AsyncState<FellowshipListSuccessState> => {
    // Subscribe to store states
    const tableStore = useStore(fellowshipTableStore);
    const filterStore = useStore(fellowshipFilterStore);

    // Fetch initial data using react-query
    const queryResult = useQuery<FellowshipsQueryResult, Error>({
        // Use QueryKeys for consistency
        queryKey: [QueryKeys.fellowships.all, filterStore.getQueryParams()], // Include filters in query key
        queryFn: () => fellowshipService.fetchInitial(filterStore.getQueryParams()),
        refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
        retry: false, // Optional: Disable automatic retries on error
    });

    // Reset stores when component unmounts (optional cleanup)
    useEffect(() => {
        return () => {
            // Consider if reset is desired on unmount, usually handled by page navigation or specific logic
            // tableStore.reset();
            // filterStore.clearFilters();
        };
    }, []);

    // Determine the current UI state based on query result and local store data
    const state = determineQueryState<FellowshipsQueryResult>({
        queryResult,
        // Use data from the store as local data if available
        localData: {
            hasData: tableStore.fellowships.all.length > 0,
            data: {
                fellowships: tableStore.fellowships.all,
                total: tableStore.pagination.totalResults,
            },
        },
        resourceType: "Fellowships", // For potential generic error messages
        // Factory function to create the success state when data is loaded
        // This function uses the createFellowshipListSuccessState which now implicitly
        // expects the updated types from types.ts via its parameters.
        onCustomSuccess: (data) => createFellowshipListSuccessState({
            initialFetchResult: data,
            tableStore: { ...tableStore }, // Pass store state and actions
            filterStore: { ...filterStore }, // Pass filter state and actions
        }) as AsyncState,
        // Example: Custom handling for 404 (though unlikely for a list)
        // onNotFound: () => AsyncStateFactory.error({
        //     error: "No fellowships found for the current filters.",
        //     retry: queryResult.refetch
        // })
    });

    // Ensure the returned state type matches expectation using the updated FellowshipListSuccessState
    return state as AsyncState<FellowshipListSuccessState>;
};