import { Fellowship } from "@/models";
import { FellowshipFilterState } from "./store.filters";
import { JSX } from "react";
import { StructuredSuccessState } from "../_new_state";

/**
 * Props for fellowship table (non-action properties)
 */
export interface FellowshipTableProps {
    render: () => JSX.Element;
    fellowshipCount: number;
    filters: FellowshipFilterState;
}

/**
 * Actions for fellowship table
 */
export interface FellowshipTableActions {
    // Table-related actions from store
    expandFellowship: (fellowship: Fellowship) => void;
    collapseAll: () => void;
    toggleSelectFellowship: (fellowship: Fellowship) => void;
    clearSelection: () => void;
    setSelectedFellowships: (fellowships: Fellowship[]) => void;
    setCurrPage: (page: number) => void;

    // Filter-related actions
    setFilter: <K extends keyof FellowshipFilterState>(
        key: K,
        value: FellowshipFilterState[K],
    ) => void;
    applyFilters: (filters: Partial<FellowshipFilterState>) => void;
    clearFilters: () => void;
    toggleFiltersVisible: () => void;
    setSorting: (field: string, direction: "asc" | "desc") => void;

    // Pagination and data fetching
    fetchMore: (page: number) => Promise<void>;
    refresh: () => void;
}

/**
 * Fellowship-specific actions
 */
export interface FellowshipItemActions {
    edit: (fellowship: Fellowship) => void;
    view: (fellowship: Fellowship) => void;
    delete: (fellowship: Fellowship) => void;
    viewMembers: (fellowship: Fellowship) => void;
}

/**
 * Page-level actions
 */
export interface FellowshipPageActions {
    addNew: () => void;
}

/**
 * Success state for the fellowship list page with strongly typed actions
 */
export class FellowshipListSuccessState extends StructuredSuccessState<
    Fellowship[],
    {
        page: FellowshipPageActions;
        table: FellowshipTableActions & FellowshipTableProps;
        fellowship: FellowshipItemActions;
    }
> {
    constructor(
        fellowships: Fellowship[],
        tableProps: FellowshipTableProps,
        tableActions: FellowshipTableActions,
        fellowshipActions: FellowshipItemActions,
        pageActions: FellowshipPageActions,
    ) {
        // Combine into the structure expected by StructuredSuccessState
        const actions = {
            page: pageActions,
            table: {
                ...tableProps,
                ...tableActions,
            },
            fellowship: fellowshipActions,
        };

        super(fellowships, actions);
    }
}
