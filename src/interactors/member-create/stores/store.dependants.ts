import { create } from "zustand";
import { Dependant as DependantInfo } from "../types";
import { DEFAULT_DEPENDANTS_INFO } from "../schemas/schemas.dependants";

/**
 * Dependants state
 */
export interface DependantsState {
    dependants: DependantInfo[];
}

/**
 * Dependants actions
 */
export interface DependantsActions {
    // Add a dependant
    addDependant: (dependant: DependantInfo) => void;

    // Update a dependant
    updateDependant: (dependant: DependantInfo) => void;

    // Remove a dependant
    removeDependant: (id: string) => void;

    // Set all dependants
    setDependants: (dependants: DependantInfo[]) => void;

    // Reset the dependants state
    reset: () => void;

    // Get all dependants
    getDependants: () => DependantInfo[];

    // Generate a temporary ID for a new dependant
    generateTempId: () => string;
}

/**
 * Initial dependants state
 */
const initialState: DependantsState = DEFAULT_DEPENDANTS_INFO;

/**
 * Create the dependants store
 */
export const useDependantsStore = create<DependantsState & DependantsActions>(
    (set, get) => ({
        ...initialState,

        addDependant: (dependant: DependantInfo) => {
            // Ensure the dependant has an ID
            const dependantWithId = dependant.id
                ? dependant
                : { ...dependant, id: get().generateTempId() };

            set((state) => ({
                dependants: [...state.dependants, dependantWithId],
            }));
        },

        updateDependant: (updatedDependant: DependantInfo) => {
            if (!updatedDependant.id) return;

            set((state) => ({
                dependants: state.dependants.map((dependant) =>
                    dependant.id === updatedDependant.id
                        ? updatedDependant
                        : dependant
                ),
            }));
        },

        removeDependant: (id: string) => {
            set((state) => ({
                dependants: state.dependants.filter((dependant) =>
                    dependant.id !== id
                ),
            }));
        },

        setDependants: (dependants: DependantInfo[]) => {
            set({ dependants });
        },

        reset: () => {
            set(initialState);
        },

        getDependants: () => {
            return get().dependants;
        },

        generateTempId: (): string => {
            return `temp-${Date.now()}-${
                Math.random().toString(36).slice(2, 9)
            }`;
        },
    }),
);
