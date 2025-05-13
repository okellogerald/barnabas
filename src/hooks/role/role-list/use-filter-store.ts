import { SortDirection } from '@/lib/query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * State interface for the role filter store
 */
export interface RoleFilterState {
  // Pagination state
  currentPage: number;
  pageSize: number;
  
  // Filter criteria
  filters: {
    name?: string;
    sortBy?: string;
    sortDirection?: SortDirection;
  };
  
  // Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<RoleFilterState['filters']>) => void;
  resetFilters: () => void;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS = {
  name: undefined,
  sortBy: 'name',
  sortDirection: SortDirection.ASC
};

/**
 * Create a Zustand store for role filters
 * Uses persist middleware to save filters between sessions
 */
export const useRoleFilterStore = create<RoleFilterState>()(
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
      setFilters: (newFilters: Partial<RoleFilterState['filters']>) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          // Reset to first page when filters change
          currentPage: 1,
        })),
      
      // Reset to defaults
      resetFilters: () => set({ 
        filters: { ...DEFAULT_FILTERS },
        currentPage: 1
      }),
    }),
    {
      name: 'role-filters',
      partialize: (state) => ({
        filters: state.filters,
        pageSize: state.pageSize,
      }),
    }
  )
);