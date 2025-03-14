import { create } from "zustand";
import { DEFAULT_INTERESTS_INFO } from "../schemas/schemas.interests";

/**
 * Interests state
 */
export interface InterestsState {
  interests: string[];
}

/**
 * Interests actions
 */
export interface InterestsActions {
  // Add an interest
  addInterest: (interest: string) => void;
  
  // Remove an interest
  removeInterest: (interest: string) => void;
  
  // Set all interests
  setInterests: (interests: string[]) => void;
  
  // Reset the interests state
  reset: () => void;
  
  // Get all interests
  getInterests: () => string[];
}

/**
 * Initial interests state
 */
const initialState: InterestsState = DEFAULT_INTERESTS_INFO

/**
 * Create the interests store
 */
export const useInterestsStore = create<InterestsState & InterestsActions>(
  (set, get) => ({
    ...initialState,
    
    addInterest: (interest: string) => {
      if (get().interests.includes(interest)) return;
      
      set((state) => ({
        interests: [...state.interests, interest],
      }));
    },
    
    removeInterest: (interest: string) => {
      set((state) => ({
        interests: state.interests.filter((i) => i !== interest),
      }));
    },
    
    setInterests: (interests: string[]) => {
      set({ interests });
    },
    
    reset: () => {
      set(initialState);
    },
    
    getInterests: () => {
      return get().interests;
    },
  })
);