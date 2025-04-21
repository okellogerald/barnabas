// features/fellowship/filter-store.ts
import { create } from "zustand";

export interface FellowshipFilters {
  searchTerm?: string;
  hasLeadership?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FellowshipFilterState {
  // Filters
  filters: FellowshipFilters;
  // Pagination
  pageSize: number;
  currentPage: number;
  // Selected items
  selectedFellowships: string[];
}

export interface FellowshipFilterActions {
  setFilters: (filters: Partial<FellowshipFilters>) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  selectFellowship: (id: string, selected: boolean) => void;
  clearSelection: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export const useFellowshipFilterStore = create<FellowshipFilterState & FellowshipFilterActions>((set) => ({
  // Initial state
  filters: {},
  pageSize: DEFAULT_PAGE_SIZE,
  currentPage: 1,
  selectedFellowships: [],

  // Actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    currentPage: 1, // Reset to first page when filters change
  })),

  resetFilters: () => set({
    filters: {},
    currentPage: 1,
  }),

  setCurrentPage: (page) => set({ currentPage: page }),
  
  setPageSize: (size) => set({ pageSize: size }),

  selectFellowship: (id, selected) => set((state) => ({
    selectedFellowships: selected 
      ? [...state.selectedFellowships, id]
      : state.selectedFellowships.filter(fellowshipId => fellowshipId !== id)
  })),

  clearSelection: () => set({ selectedFellowships: [] }),
}));