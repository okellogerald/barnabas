import { create } from 'zustand';
import { DependantInfo } from '../schemas/schemas.dependants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for the dependants store state
 */
interface DependantsState {
  dependants: DependantInfo[];
  addDependant: (dependant: DependantInfo) => void;
  updateDependant: (id: string, dependant: DependantInfo) => void;
  removeDependant: (id: string) => void;
  setDependants: (dependants: DependantInfo[]) => void;
}

/**
 * Store for managing dependants during member editing
 */
export const useDependantsStore = create<DependantsState>((set) => ({
  // Array of dependants
  dependants: [],

  // Add a new dependant
  addDependant: (dependant: DependantInfo) => set((state) => ({
    dependants: [
      ...state.dependants,
      {
        ...dependant,
        id: dependant.id || uuidv4() // Generate UUID if not provided
      }
    ]
  })),

  // Update an existing dependant
  updateDependant: (id: string, dependant: DependantInfo) => set((state) => ({
    dependants: state.dependants.map((dep) =>
      dep.id === id ? { ...dependant, id } : dep
    )
  })),

  // Remove a dependant
  removeDependant: (id: string) => set((state) => ({
    dependants: state.dependants.filter((dep) => dep.id !== id)
  })),

  // Set/replace all dependants
  setDependants: (dependants: DependantInfo[]) => set({
    dependants: dependants.map(dep => ({
      ...dep,
      id: dep.id || uuidv4() // Ensure all dependants have IDs
    }))
  })
}));