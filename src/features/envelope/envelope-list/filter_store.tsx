import { create } from "zustand";

export interface EnvelopeFilters {
    number?: number;
    isAssigned?: boolean;
    memberId?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface EnvelopeFilterState {
    // Filters
    filters: EnvelopeFilters;
    // Pagination
    pageSize: number;
    currentPage: number;
    // Selected items
    selectedEnvelopes: string[];
}

export interface EnvelopeFilterActions {
    setFilters: (filters: Partial<EnvelopeFilters>) => void;
    resetFilters: () => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    selectEnvelope: (id: string, selected: boolean) => void;
    clearSelection: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export const useEnvelopeFilterStore = create<EnvelopeFilterState & EnvelopeFilterActions>((set) => ({
    // Initial state
    filters: {},
    pageSize: DEFAULT_PAGE_SIZE,
    currentPage: 1,
    selectedEnvelopes: [],

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

    selectEnvelope: (id, selected) => set((state) => ({
        selectedEnvelopes: selected
            ? [...state.selectedEnvelopes, id]
            : state.selectedEnvelopes.filter(envelopeId => envelopeId !== id)
    })),

    clearSelection: () => set({ selectedEnvelopes: [] }),
}));