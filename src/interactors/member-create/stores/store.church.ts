import { create } from "zustand";
import { ChurchInfo, DEFAULT_CHURCH_INFO } from "../schemas/schemas.church";

/**
 * Church information actions
 */
export interface ChurchInfoActions {
    // Set a specific field
    setField: <K extends keyof ChurchInfo>(
        key: K,
        value: ChurchInfo[K],
    ) => void;

    // Set multiple fields at once
    setFields: (fields: Partial<ChurchInfo>) => void;

    // Reset the church information state
    reset: () => void;

    // Get all church information
    getChurchInfo: () => ChurchInfo;

    // Check if required fields are filled
    isValid: () => boolean;
}

/**
 * Initial church information state
 */
const initialState: ChurchInfo = DEFAULT_CHURCH_INFO

/**
 * Create the church information store
 */
export const useChurchInfoStore = create<ChurchInfo & ChurchInfoActions>(
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

        getChurchInfo: () => {
            return get();
        },

        isValid: () => {
            const { memberRole, fellowshipId } = get();
            return Boolean(memberRole && fellowshipId);
        },
    }),
);
