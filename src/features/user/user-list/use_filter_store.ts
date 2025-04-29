import { SORT_DIRECTION } from "@/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * State interface for the user filter store
 */
export interface UserFilterState {
    // Pagination state
    currentPage: number;
    pageSize: number;

    // Filter criteria
    filters: {
        name?: string;
        email?: string;
        roleId?: string;
        isActive?: boolean;
        sortBy?: string;
        sortDirection?: SORT_DIRECTION;
    };

    // Actions
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setFilters: (filters: Partial<UserFilterState["filters"]>) => void;
    resetFilters: () => void;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: UserFilterState["filters"] = {
    name: undefined,
    email: undefined,
    roleId: undefined,
    isActive: undefined,
    sortBy: "name",
    sortDirection: SORT_DIRECTION.ASC,
};

/**
 * Create a Zustand store for user filters
 * Uses persist middleware to save filters between sessions
 */
export const useUserFilterStore = create<UserFilterState>()(
    persist(
        (set) => ({
            // Default pagination values
            currentPage: 1,
            pageSize: 10,

            // Default filter values
            filters: { ...DEFAULT_FILTERS },

            // Set current page
            setCurrentPage: (page: number) => set({ currentPage: page }),

            // Set page size
            setPageSize: (size: number) => set({ pageSize: size }),

            // Update filters (partial update)
            setFilters: (newFilters: Partial<UserFilterState["filters"]>) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                    // Reset to first page when filters change
                    currentPage: 1,
                })),

            // Reset to defaults
            resetFilters: () =>
                set({
                    filters: { ...DEFAULT_FILTERS },
                    currentPage: 1,
                }),
        }),
        {
            name: "user-filters",
            partialize: (state) => ({
                filters: state.filters,
                pageSize: state.pageSize,
            }),
        },
    ),
);
