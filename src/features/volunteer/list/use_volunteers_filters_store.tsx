import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SortDirection } from "@/lib/query";
import { AppConfig } from "@/app";

/**
 * Store for volunteer opportunity filters and pagination state
 */
interface VolunteerFilterState {
    // Filter state
    filters: {
        name?: string;
        description?: string;
        memberId?: string;
        hasMembers?: boolean;
        sortBy?: string;
        sortDirection?: SortDirection;
    };

    // Pagination state
    currentPage: number;
    pageSize: number;

    // Actions
    setFilters: (filters: Partial<VolunteerFilterState["filters"]>) => void;
    setSortBy: (field: string, direction: SortDirection) => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    resetFilters: () => void;
}

/**
 * Default filters for volunteer opportunities
 */
const DEFAULT_FILTERS = {
    name: undefined,
    description: undefined,
    memberId: undefined,
    hasMembers: undefined,
    sortBy: "name",
    sortDirection: SortDirection.ASC,
};

/**
 * Zustand store for volunteer opportunity filters
 */
export const useVolunteerFilterStore = create<VolunteerFilterState>()(
    persist(
        (set) => ({
            // Initial filter state
            filters: { ...DEFAULT_FILTERS },

            // Initial pagination state
            currentPage: 1,
            pageSize: AppConfig.DEFAULT_PAGE_SIZE,

            // Action to update filters
            setFilters: (newFilters) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        ...newFilters,
                    },
                })),

            // Action to update sort
            setSortBy: (field, direction) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        sortBy: field,
                        sortDirection: direction,
                    },
                })),

            // Action to update current page
            setCurrentPage: (page) => set({ currentPage: page }),

            // Action to update page size
            setPageSize: (size) => set({ pageSize: size }),

            // Action to reset filters to defaults
            resetFilters: () =>
                set({
                    filters: { ...DEFAULT_FILTERS },
                    currentPage: 1,
                }),
        }),
        {
            name: "volunteer-filters",
            partialize: (state) => ({
                filters: state.filters,
                pageSize: state.pageSize,
            }),
        }
    )
);