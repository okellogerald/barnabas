import { PAGINATION } from "@/constants";
import { Fellowship } from "@/models";
import { create } from "zustand";

/**
 * State structure for the fellowships table
 */
export interface FellowshipsTableState {
    /** Fellowship collections */
    fellowships: {
        /** All fellowships loaded */
        all: Fellowship[];
        /** Selected fellowships */
        selected: Fellowship[];
    };
    /** Active fellowship states */
    fellowship: {
        /** Currently expanded fellowship row */
        expanded: Fellowship | null;
        /** Currently active fellowship (for actions) */
        active: Fellowship | null;
    };
    /** Pagination state */
    pagination: {
        /** Current page (1-indexed) */
        currPage: number;
        /** Total number of results */
        totalResults: number;
        /** Results per page */
        resultsPerPage: number;
    };
}

/**
 * Actions available in the fellowships table store
 */
export interface FellowshipsTableActions {
    /** Initialize the store with data */
    init: (fellowships: Fellowship[], totalResults: number) => void;
    /** Add more fellowships to the store (pagination) */
    addToFellowships: (fellowships: Fellowship[], currPage: number) => void;
    /** Set the current page */
    setCurrPage: (currPage: number) => void;
    /** Toggle selection of a fellowship */
    toggleSelectFellowship: (fellowship: Fellowship) => void;
    /** Expand a fellowship row */
    expandFellowship: (fellowship: Fellowship) => void;
    /** Collapse all expanded rows */
    collapseAll: () => void;
    /** Set selected fellowships */
    setSelectedFellowships: (fellowships: Fellowship[]) => void;
    /** Clear selection */
    clearSelection: () => void;
    /** Reset the store to initial state */
    reset: () => void;
}

/**
 * Initial state for the fellowships table
 */
const initialState: FellowshipsTableState = {
    fellowships: {
        all: [],
        selected: [],
    },
    fellowship: {
        expanded: null,
        active: null,
    },
    pagination: {
        currPage: PAGINATION.INITIAL_PAGE,
        totalResults: 0,
        resultsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
    },
};

/**
 * Creates the fellowship table store
 */
export const createFellowshipTableStore = () =>
    create<FellowshipsTableState & FellowshipsTableActions>((set, get) => ({
        ...initialState,

        init: (fellowships: Fellowship[], totalResults: number) => {
            set({
                fellowships: {
                    all: fellowships,
                    selected: [],
                },
                pagination: {
                    currPage: PAGINATION.INITIAL_PAGE,
                    totalResults,
                    resultsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
                },
            });
        },

        addToFellowships: (fellowships: Fellowship[], currPage: number) => {
            set((state) => ({
                fellowships: {
                    ...state.fellowships,
                    all: [...state.fellowships.all, ...fellowships],
                },
                pagination: { ...state.pagination, currPage },
            }));
        },

        setCurrPage: (currPage: number) => {
            set((state) => ({
                pagination: { ...state.pagination, currPage },
            }));
        },

        toggleSelectFellowship: (fellowship: Fellowship) => {
            const { selected } = get().fellowships;
            const isSelected = selected.some((f) => f.id === fellowship.id);

            const newSelected = isSelected
                ? selected.filter((f) => f.id !== fellowship.id)
                : [...selected, fellowship];

            set((state) => ({
                fellowships: { ...state.fellowships, selected: newSelected },
            }));
        },

        expandFellowship: (fellowship: Fellowship) => {
            const oldExpandedId = get().fellowship.expanded?.id;

            set((state) => ({
                fellowship: {
                    ...state.fellowship,
                    expanded: oldExpandedId === fellowship.id
                        ? null
                        : fellowship,
                },
            }));
        },

        collapseAll: () => {
            set((state) => ({
                fellowship: {
                    ...state.fellowship,
                    expanded: null,
                },
            }));
        },

        clearSelection: () => {
            set((state) => ({
                fellowships: { ...state.fellowships, selected: [] },
            }));
        },

        setSelectedFellowships: (selected: Fellowship[]) => {
            set((state) => ({
                fellowships: { ...state.fellowships, selected },
            }));
        },

        reset: () => set(initialState),
    }));

// Create and export the singleton instance
export const fellowshipTableStore = createFellowshipTableStore();
