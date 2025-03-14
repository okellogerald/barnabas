import { create } from "zustand";
import { DEFAULT_MARITAL_INFO, MaritalInfo } from "../schemas/schemas.marital";

/**
 * Marital information actions
 */
export interface MaritalInfoActions {
    // Set a specific field
    setField: <K extends keyof MaritalInfo>(
        key: K,
        value: MaritalInfo[K],
    ) => void;

    // Set multiple fields at once
    setFields: (fields: Partial<MaritalInfo>) => void;

    // Reset the marital information state
    reset: () => void;

    // Get all marital information
    getMaritalInfo: () => MaritalInfo;

    // Check if required fields are filled
    isValid: () => boolean;
}

/**
 * Initial marital information state
 */
const initialState: MaritalInfo = DEFAULT_MARITAL_INFO;

/**
 * Create the marital information store
 */
export const useMaritalInfoStore = create<
    MaritalInfo & MaritalInfoActions
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

        getMaritalInfo: () => {
            return get();
        },

        isValid: () => {
            const { maritalStatus } = get();
            return Boolean(maritalStatus);
        },
    }),
);
