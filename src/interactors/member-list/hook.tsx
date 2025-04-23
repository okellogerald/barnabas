// import { useQuery } from "@tanstack/react-query";
// import { MemberListPageUIState } from "./types";
// import { QueryKeys } from "../_queries/queries";
// import { determineUIState, UIStateFactory } from "../_state";
// import { useStore } from "zustand";
// import { createSuccessState } from "./ui_factory";
// import { memberFilterStore } from "./store.filters";
// import { memberTableStore } from "./store.table";
// import { memberService } from "./service";

// /**
//  * Hook for managing the member list page with filters
//  * @returns UI state for the member list page
//  */
// export const useMemberList = (): MemberListPageUIState => {
//     // Access the stores
//     const table_store = useStore(memberTableStore);
//     const filters_store = useStore(memberFilterStore)

//     // Fetch members data with the current filters
//     const query = useQuery({
//         queryKey: [QueryKeys.members.all, filters_store.getQueryParams()],
//         queryFn: () => memberService.fetchInitial(filters_store.getQueryParams()),
//         // Prevent auto-refetching on window focus for large datasets
//         refetchOnWindowFocus: false,
//     });

//     // Determine the current UI state based on the query
//     const uiState = determineUIState<Exclude<typeof query.data, undefined>, MemberListPageUIState>({
//         queryResult: query,
//         onLoading: () => UIStateFactory.loading(),
//         onError: () => UIStateFactory.error({
//             retry: query.refetch,
//             message: query.error?.message,
//         }),
//         onSuccess: (result) => createSuccessState({
//             initialFetchResult: result,
//             tableStore: table_store,
//             filterStore: filters_store,
//         }),
//         onPermissionError: (error) => UIStateFactory.unauthorized({ error }),
//     });

//     return uiState;
// };

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { MemberListPageUIState } from "./types";
import { QueryKeys } from "../_queries/queries";
import { determineUIState, UIStateFactory } from "../_state";
import { useStore } from "zustand";
import { createSuccessState } from "./ui_factory";
import { memberFilterStore } from "./store.filters";
import { memberTableStore } from "./store.table";
import { memberService } from "./service";

/**
 * Hook for managing the member list page with filters
 * @returns UI state for the member list page
 */
export const useMemberList = (): MemberListPageUIState => {
    // Access the stores
    const table_store = useStore(memberTableStore);
    const filters_store = useStore(memberFilterStore);
    
    // Get URL params
    const [searchParams] = useSearchParams();
    const location = useLocation();
    
    // Check for query parameters or state passed from navigation
    useEffect(() => {
        const storedFellowshipId = sessionStorage.getItem('memberList_fellowshipId');
        
        if (storedFellowshipId) {
            // Apply fellowship filter if it's in the URL or state
            filters_store.applyFilters({ fellowshipId: storedFellowshipId });
        }
    }, [searchParams, location.state]);

    // Fetch members data with the current filters
    const query = useQuery({
        queryKey: [QueryKeys.members.all, filters_store.getQueryParams()],
        queryFn: () => memberService.fetchInitial(filters_store.getQueryParams()),
        // Prevent auto-refetching on window focus for large datasets
        refetchOnWindowFocus: false,
    });

    // Determine the current UI state based on the query
    const uiState = determineUIState<Exclude<typeof query.data, undefined>, MemberListPageUIState>({
        queryResult: query,
        onLoading: () => UIStateFactory.loading(),
        onError: () => UIStateFactory.error({
            retry: query.refetch,
            message: query.error?.message,
        }),
        onSuccess: (result) => createSuccessState({
            initialFetchResult: result,
            tableStore: table_store,
            filterStore: filters_store,
        }),
        onPermissionError: (error) => UIStateFactory.unauthorized({ error }),
    });

    return uiState;
};