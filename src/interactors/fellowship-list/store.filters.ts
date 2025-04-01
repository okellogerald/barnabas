import { create } from "zustand";
import { FELLOWSHIP_UI } from "./constants";

/**
 * Direct mapping to fellowship model properties for objection-find
 */
export interface FellowshipQueryParams {
    // Direct model properties
    name?: string;
    chairmanId?: string;
    secretaryId?: string;
    hasLeadership?: number; // 0 or 1, derived on backend
    hasMembers?: number; // 0 or 1, derived on backend
    // Sorting
    orderBy?: string;
    orderByDesc?: string;
}

/**
 * State for fellowship list filters
 */
export interface FellowshipFilterState extends FellowshipQueryParams {
    // UI-specific filter state
    filtersVisible: boolean;
    filtersApplied: boolean;
}

/**
 * Actions for fellowship list filters
 */
export interface FellowshipFilterActions {
    /**
     * Set a specific filter value
     */
    setFilter: <K extends keyof FellowshipQueryParams>(
        key: K,
        value: FellowshipQueryParams[K],
    ) => void;

    /**
     * Apply multiple filters at once
     */
    applyFilters: (filters: Partial<FellowshipQueryParams>) => void;

    /**
     * Clear all filters
     */
    clearFilters: () => void;

    /**
     * Toggle filter panel visibility
     */
    toggleFiltersVisible: () => void;

    /**
     * Set sort order
     */
    setSorting: (field: string, direction: "asc" | "desc") => void;

    /**
     * Get query params for API calls
     */
    getQueryParams: () => FellowshipQueryParams;
}

/**
 * Initial state for filters
 */
const initialFilterState: FellowshipFilterState = {
    name: undefined,
    chairmanId: undefined,
    secretaryId: undefined,
    hasLeadership: undefined,
    hasMembers: undefined,
    orderBy: FELLOWSHIP_UI.SORTING.DEFAULT_FIELD,
    orderByDesc: undefined,
    filtersVisible: false,
    filtersApplied: false,
};

/**
 * Checks if any filter has been applied (differs from initial values)
 * @param filters The current filter values to check
 * @returns True if at least one filter differs from its initial value
 */
export const canApplyFilters = (
    filters: Partial<FellowshipQueryParams>,
): boolean => {
    // Check string filters - compare against empty string rather than undefined
    const isNameApplied = filters.name !== undefined &&
        filters.name !== "" &&
        filters.name !== initialFilterState.name;

    // Check other filters against their initial values
    const isChairmanApplied = filters.chairmanId !== undefined &&
        filters.chairmanId !== initialFilterState.chairmanId;

    const isSecretaryApplied = filters.secretaryId !== undefined &&
        filters.secretaryId !== initialFilterState.secretaryId;

    const isLeadershipApplied = filters.hasLeadership !== undefined &&
        filters.hasLeadership !== initialFilterState.hasLeadership;

    const isMembersApplied = filters.hasMembers !== undefined &&
        filters.hasMembers !== initialFilterState.hasMembers;

    // Return true if any filter is applied
    return (
        isNameApplied ||
        isChairmanApplied ||
        isSecretaryApplied ||
        isLeadershipApplied ||
        isMembersApplied
    );
};

/**
 * Create a filter store
 */
export const fellowshipFilterStore = create<
    FellowshipFilterState & FellowshipFilterActions
>()((set, get) => ({
    ...initialFilterState,

    setFilter: (key, value) => {
        set((state) => ({
            ...state,
            [key]: value,
        }));
    },

    applyFilters: (filters) => {
        set((state) => ({
            ...state,
            ...filters,
            filtersApplied: canApplyFilters(filters),
        }));
    },

    clearFilters: () => {
        set({
            ...initialFilterState,
            filtersVisible: true, // Keep panel open after clearing
            filtersApplied: false,
        });
    },

    toggleFiltersVisible: () => {
        set((state) => ({
            ...state,
            filtersVisible: !state.filtersVisible,
        }));
    },

    setSorting: (field, direction) => {
        if (direction === "asc") {
            set({
                orderBy: field,
                orderByDesc: undefined,
            });
        } else {
            set({
                orderBy: undefined,
                orderByDesc: field,
            });
        }
    },

    getQueryParams: () => {
        const state = get();
        const params: FellowshipQueryParams = {};

        // Only include non-undefined/non-empty string values
        if (state.name) params.name = state.name;
        if (state.chairmanId) params.chairmanId = state.chairmanId;
        if (state.secretaryId) params.secretaryId = state.secretaryId;
        if (state.hasLeadership !== undefined) {
            params.hasLeadership = state.hasLeadership;
        }
        if (state.hasMembers !== undefined) {
            params.hasMembers = state.hasMembers;
        }

        // Handle sorting - only include one sorting parameter
        if (state.orderByDesc) {
            params.orderByDesc = state.orderByDesc;
        } else if (state.orderBy) {
            params.orderBy = state.orderBy;
        }

        return params;
    },
}));

/**
 * Retrieves the current filter parameters
 * Non-hook version for use outside React components
 */
export const getFilterParams = (): FellowshipQueryParams => {
    return fellowshipFilterStore.getState().getQueryParams();
};
