import { create } from "zustand";

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
    orderBy: "firstName", // Default sorting
    orderByDesc: undefined,
    filtersVisible: false,
    filtersApplied: false,
};

/**
 * Create a persisted filter store
 */
export const memberFilterStore = create<
    MemberFilterState & MemberFilterActions
>()(
    (set, get) => ({
        ...initialFilterState,

        setFilter: (key, value) => {
            set((state) => ({
                ...state,
                [key]: value,
                //  filtersApplied: true,
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
                    filtersApplied: false,
                });
            } else {
                set({
                    orderBy: undefined,
                    orderByDesc: field,
                    filtersApplied: false,
                });
            }
        },

        getQueryParams: () => {
            const state = get();

            // Only include non-undefined values to avoid sending empty parameters
            const params: MemberQueryParams = {};

            if (state.firstName) params.firstName = state.firstName;
            if (state.lastName) params.lastName = state.lastName;
            if (state.fellowshipId) {
                params.fellowshipId = state.fellowshipId;
            }
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
    }),
);

/**
 * Retrieves the current filter parameters from the member filter store,
 * formatted to match the backend model keys. This function does not use React hooks.
 *
 * @returns {MemberQueryParams} The current filter parameters.
 */
export const getFilterParams = (): MemberQueryParams => {
    const state = memberFilterStore.getState();

    // Only include non-undefined values to avoid sending empty parameters
    const params: MemberQueryParams = {};

    if (state.firstName) params.firstName = state.firstName;
    if (state.lastName) params.lastName = state.lastName;
    if (state.fellowshipId) params.fellowshipId = state.fellowshipId;
    if (state.isBaptized !== undefined) params.isBaptized = state.isBaptized;
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
    return isFirstNameApplied ||
        isLastNameApplied ||
        isFellowshipApplied ||
        isBaptizedApplied ||
        isAttendsFellowshipApplied;
};
