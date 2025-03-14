import { create } from "zustand";
import { DEFAULT_PROFESSIONAL_INFO, ProfessionalInfo } from "../schemas/schemas.professional";

/**
 * Professional information actions
 */
export interface ProfessionalInfoActions {
    // Set a specific field
    setField: <K extends keyof ProfessionalInfo>(
        key: K,
        value: ProfessionalInfo[K],
    ) => void;

    // Set multiple fields at once
    setFields: (fields: Partial<ProfessionalInfo>) => void;

    // Reset the professional information state
    reset: () => void;

    // Get all professional information
    getProfessionalInfo: () => ProfessionalInfo;

    // Professional information is all optional, so it's always valid
    isValid: () => boolean;
}

/**
 * Initial professional information state
 */
const initialState: ProfessionalInfo = DEFAULT_PROFESSIONAL_INFO;

/**
 * Create the professional information store
 */
export const useProfessionalInfoStore = create<
    ProfessionalInfo & ProfessionalInfoActions
>(
    (set, get) => ({
        ...initialState,

        setField: (key, value) => {
            set({ [key]: value });
        },

        setFields: (fields) => {
            set(fields);
        },

        reset: () => {
            set(initialState);
        },

        getProfessionalInfo: () => {
            return get();
        },

        isValid: () => {
            // Professional information is all optional
            return true;
        },
    }),
);
