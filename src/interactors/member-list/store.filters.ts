import { create } from "zustand";
import { MEMBER_UI } from "@/constants";

/**
 * Direct mapping to member model properties for objection-find
 */
export interface MemberQueryParams {
    // Direct model properties
    firstName?: string;
    lastName?: string;
    fellowshipId?: string;
    isBaptized?: number; // 0 or 1
    attendsFellowship?: number; // 0 or 1
    // Sorting
    orderBy?: string;
    orderByDesc?: string;
}

/**
 * State for member list filters
 */
export interface MemberFilterState extends MemberQueryParams {
    // UI-specific filter state
    filtersVisible: boolean;
    filtersApplied: boolean;
}

/**
 * Actions for member list filters
 */
export interface MemberFilterActions {
    /**
     * Set a specific filter value
     */
    setFilter: <K extends keyof MemberQueryParams>(
        key: K,
        value: MemberQueryParams[K],
    ) => void;

    /**
     * Apply multiple filters at once
     */
    applyFilters: (filters: Partial<MemberQueryParams>) => void;

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
    getQueryParams: () => MemberQueryParams;
}

/**
 * Initial state for filters
 */
const initialFilterState: MemberFilterState = {
    firstName: undefined,
    lastName: undefined,
    fellowshipId: undefined,
    isBaptized: undefined,
    attendsFellowship: undefined,
    orderBy: MEMBER_UI.SORTING.DEFAULT_FIELD,
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
    filters: Partial<MemberQueryParams>,
): boolean => {
    // Check string filters - compare against empty string rather than undefined
    const isFirstNameApplied = filters.firstName !== undefined &&
        filters.firstName !== "" &&
        filters.firstName !== initialFilterState.firstName;

    const isLastNameApplied = filters.lastName !== undefined &&
        filters.lastName !== "" &&
        filters.lastName !== initialFilterState.lastName;

    // Check other filters against their initial values
    const isFellowshipApplied = filters.fellowshipId !== undefined &&
        filters.fellowshipId !== initialFilterState.fellowshipId;

    const isBaptizedApplied = filters.isBaptized !== undefined &&
        filters.isBaptized !== initialFilterState.isBaptized;

    const isAttendsFellowshipApplied =
        filters.attendsFellowship !== undefined &&
        filters.attendsFellowship !== initialFilterState.attendsFellowship;

    // Return true if any filter is applied
    return (
        isFirstNameApplied ||
        isLastNameApplied ||
        isFellowshipApplied ||
        isBaptizedApplied ||
        isAttendsFellowshipApplied
    );
};

/**
 * Create a filter store
 */
export const memberFilterStore = create<
    MemberFilterState & MemberFilterActions
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
        const params: MemberQueryParams = {};

        // Only include non-undefined/non-empty string values
        if (state.firstName) params.firstName = state.firstName;
        if (state.lastName) params.lastName = state.lastName;
        if (state.fellowshipId) params.fellowshipId = state.fellowshipId;
        if (state.isBaptized !== undefined) {
            params.isBaptized = state.isBaptized;
        }
        if (state.attendsFellowship !== undefined) {
            params.attendsFellowship = state.attendsFellowship;
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
export const getFilterParams = (): MemberQueryParams => {
    return memberFilterStore.getState().getQueryParams();
};
