import { create } from "zustand";
import { DependantAddInfo, DependantInfo } from "../schemas/schemas.dependants";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface for the dependants store state
 */
interface DependantsState {
  dependants: DependantInfo[];
  initialDependantIds: string[];
  addDependant: (dependant: DependantAddInfo) => void;
  updateDependant: (dependant: DependantInfo) => void;
  removeDependant: (id: string) => void;
  setInitialDependants: (dependants: DependantInfo[]) => void;

  getNewlyAddedDependants: () => DependantAddInfo[];
  getUpdatedOldDependants: () => DependantInfo[];
  getDeletedDependantsIds: () => string[];
}

/**
 * Store for managing dependants during member editing
 */
export const useDependantsStore = create<DependantsState>((set, get) => ({
  // Array of dependants
  dependants: [],
  initialDependantIds: [],

  // Add a new dependant
  addDependant: (dependant: DependantAddInfo) =>
    set((state) => ({
      dependants: [
        ...state.dependants,
        {
          ...dependant,
          id: uuidv4(),
        },
      ],
    })),

  // Update an existing dependant
  updateDependant: (dependant: DependantInfo) =>
    set((state) => ({
      dependants: state.dependants.map((dep) =>
        dep.id === dependant.id ? dependant : dep
      ),
    })),

  // Remove a dependant
  removeDependant: (id: string) =>
    set((state) => ({
      dependants: state.dependants.filter((dep) => dep.id !== id),
    })),

  // Set initial dependants from member object
  setInitialDependants: (dependants: DependantInfo[]) => {
    const deps = dependants.map((dep) => ({
      id: dep.id,
      firstName: dep.firstName,
      lastName: dep.lastName,
      dateOfBirth: dep.dateOfBirth,
      relationship: dep.relationship,
    }));
    return set({
      dependants: deps,
      initialDependantIds: deps.map((e) => e.id),
    });
  },

  getUpdatedOldDependants: () => {
    // Example
    // current [2,3,4]
    // initial [0,1,2]
    // so all that's in current that's also in initial == updated old dependants
    const updatedOldDeps: DependantInfo[] = [];
    for (const e of get().dependants) {
      if (get().initialDependantIds.includes(e.id)) {
        updatedOldDeps.push(e);
      }
    }

    return updatedOldDeps;
  },

  getDeletedDependantsIds: () => {
    // Example
    // initial [0,1,2]
    // current [2,3,4]
    // so all that's in initial that's not in current == deleted
    const currentIds = get().dependants.map((e) => e.id).filter((e) =>
      e !== undefined
    );
    const deletedDepsIds = [];
    for (const id of get().initialDependantIds) {
      if (!currentIds.includes(id)) {
        deletedDepsIds.push(id);
      }
    }

    return deletedDepsIds;
  },

  getNewlyAddedDependants: () => {
    const allDependants = get().dependants;
    const newlyAddedDeps = [];
    for (const e of allDependants) {
      if (!get().initialDependantIds.includes(e.id)) {
        const { id, ...data } = e;
        newlyAddedDeps.push(data);
      }
    }

    return newlyAddedDeps;
  },
}));
