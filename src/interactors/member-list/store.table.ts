import { PAGINATION } from "@/constants";
import { Member } from "@/models";
import { create } from "zustand";

/**
 * State structure for the members table
 */
export interface MembersTableState {
  /** Member collections */
  members: {
    /** All members loaded */
    all: Member[];
    /** Selected members */
    selected: Member[];
  };
  /** Active member states */
  member: {
    /** Currently expanded member row */
    expanded: Member | null;
    /** Currently active member (for actions) */
    active: Member | null;
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
 * Actions available in the members table store
 */
export interface MembersTableActions {
  /** Initialize the store with data */
  init: (members: Member[], totalResults: number) => void;
  /** Add more members to the store (pagination) */
  addToMembers: (members: Member[], currPage: number) => void;
  /** Set the current page */
  setCurrPage: (currPage: number) => void;
  /** Toggle selection of a member */
  toggleSelectMember: (member: Member) => void;
  /** Expand a member row */
  expandMember: (member: Member) => void;
  /** Collapse all expanded rows */
  collapseAll: () => void;
  /** Set selected members */
  setSelectedMembers: (members: Member[]) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Reset the store to initial state */
  reset: () => void;
}

/**
 * Initial state for the members table
 */
const initialState: MembersTableState = {
  members: {
    all: [],
    selected: [],
  },
  member: {
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
 * Creates the member table store
 */
export const createMemberTableStore = () =>
  create<MembersTableState & MembersTableActions>((set, get) => ({
    ...initialState,

    init: (members: Member[], totalResults: number) => {
      set({
        members: {
          all: members,
          selected: [],
        },
        pagination: {
          currPage: PAGINATION.INITIAL_PAGE,
          totalResults,
          resultsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
        },
      });
    },

    addToMembers: (members: Member[], currPage: number) => {
      set((state) => ({
        members: {
          ...state.members,
          all: [...state.members.all, ...members],
        },
        pagination: { ...state.pagination, currPage },
      }));
    },

    setCurrPage: (currPage: number) => {
      set((state) => ({
        pagination: { ...state.pagination, currPage },
      }));
    },

    toggleSelectMember: (member: Member) => {
      const { selected } = get().members;
      const isSelected = selected.some((m) => m.id === member.id);

      const newSelected = isSelected
        ? selected.filter((m) => m.id !== member.id)
        : [...selected, member];

      set((state) => ({
        members: { ...state.members, selected: newSelected },
      }));
    },

    expandMember: (member: Member) => {
      const oldExpandedId = get().member.expanded?.id;

      set((state) => ({
        member: {
          ...state.member,
          expanded: oldExpandedId === member.id ? null : member,
        },
      }));
    },

    collapseAll: () => {
      set((state) => ({
        member: {
          ...state.member,
          expanded: null,
        },
      }));
    },

    clearSelection: () => {
      set((state) => ({
        members: { ...state.members, selected: [] },
      }));
    },

    setSelectedMembers: (selected: Member[]) => {
      set((state) => ({
        members: { ...state.members, selected },
      }));
    },

    reset: () => set(initialState),
  }));

// Create and export the singleton instance
export const memberTableStore = createMemberTableStore();