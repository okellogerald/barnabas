import {
    FellowshipItemActions,
    FellowshipListPageActions,
    FellowshipListPageTableProps,
    FellowshipListSuccessState,
    FellowshipPageActions,
} from "./types";
import { Fellowship } from "@/models";
import {
    FellowshipFilterActions,
    FellowshipFilterState,
} from "./store.filters"; 
import { fellowshipService, FellowshipsQueryResult } from "./service"; 
import { Navigation } from "@/app";
import { FellowshipsTableActions, FellowshipsTableState } from "./store.table";
import { renderFellowshipTable } from "./ui.table_renderer";

/**
 * Creates the success state for the fellowship list UI
 * @param params Parameters for creating the success state
 * @param params.initialFetchResult The initial data fetched from the API (type FellowshipsQueryResult).
 * @param params.tableStore The Zustand store instance for table state and actions.
 * @param params.filterStore The Zustand store instance for filter state and actions.
 * @returns The success state object conforming to FellowshipListSuccessState.
 */
export const createFellowshipListSuccessState = (params: {
    initialFetchResult: FellowshipsQueryResult; // This contains { fellowships: Fellowship[], total: number }
    tableStore: FellowshipsTableState & FellowshipsTableActions; // Combines state and actions from table store
    filterStore: FellowshipFilterState & FellowshipFilterActions; // Combines state and actions from filter store
}): FellowshipListSuccessState => {
    const { initialFetchResult, tableStore, filterStore } = params;

    // Combine store and service actions into the structured action groups defined in types.ts
    const tableActions: FellowshipListPageActions = {
        // Store actions
        expandFellowship: tableStore.expandFellowship,
        collapseAll: tableStore.collapseAll,
        toggleSelectFellowship: tableStore.toggleSelectFellowship,
        clearSelection: tableStore.clearSelection,
        setSelectedFellowships: tableStore.setSelectedFellowships,
        setCurrPage: tableStore.setCurrPage, // Usually triggers fetchMore
        // Filter actions
        setFilter: filterStore.setFilter,
        applyFilters: filterStore.applyFilters,
        clearFilters: filterStore.clearFilters,
        toggleFiltersVisible: filterStore.toggleFiltersVisible,
        setSorting: filterStore.setSorting,
        // Service actions mapped to interface
        fetchMore: fellowshipService.handlePagination,
        refresh: fellowshipService.refresh,
    };

    const fellowshipItemActions: FellowshipItemActions = {
        edit: (fellowship: Fellowship) => {
            Navigation.Fellowships.toEdit(fellowship.id);
        },
        view: (fellowship: Fellowship) => {
            tableStore.expandFellowship(fellowship);
        },
        delete: async (fellowship: Fellowship) => {
            console.log(fellowship);
        },
        viewMembers: (fellowship: Fellowship) => {
            Navigation.Members.toList(); // Add filter parameters if needed
            console.log("Navigate to members of fellowship:", fellowship.id);
        },
    };

    const pageActions: FellowshipPageActions = {
        addNew: () => {
            Navigation.Fellowships.toCreate();
        },
    };

    // Props needed by the table renderer/component
    const tableProps: FellowshipListPageTableProps = {
        fellowshipCount: tableStore.pagination.totalResults,
        filters: filterStore, // Pass the filter state
        render: () =>
            renderFellowshipTable({
                // Pass the actual array of fellowships from the store for rendering
                fellowships: tableStore.fellowships.all,
                actions: { // Pass the structured actions
                    ...pageActions,
                    ...tableProps,
                    ...tableActions,
                    ...fellowshipItemActions,
                },
                tableState: tableStore, // Pass the table state for pagination, selection etc.
            }),
    };

    // Instantiate the success state class
    // **CORRECTION HERE:** Pass the full initialFetchResult as the data payload
    return new FellowshipListSuccessState(
        initialFetchResult.fellowships,
        tableProps,
        tableActions,
        fellowshipItemActions,
        pageActions,
    );
};
