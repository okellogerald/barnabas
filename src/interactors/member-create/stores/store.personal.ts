import { create } from "zustand";
import { DEFAULT_PERSONAL_INFO, PersonalInfo } from "../schemas/schemas.personal";

/**
 * Personal information actions
 */
export interface PersonalInfoActions {
    // Set a specific field
    setField: <K extends keyof PersonalInfo>(
        key: K,
        value: PersonalInfo[K],
    ) => void;

    // Set multiple fields at once
    setFields: (fields: Partial<PersonalInfo>) => void;

    // Reset the personal information state
    reset: () => void;

    // Get all personal information
    getPersonalInfo: () => PersonalInfo;

    // Check if required fields are filled
    isValid: () => boolean;
}

/**
 * Initial personal information state
 */
const initialState: PersonalInfo = DEFAULT_PERSONAL_INFO

/**
 * Create the personal information store
 */
export const usePersonalInfoStore = create<
    PersonalInfo & PersonalInfoActions
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

        getPersonalInfo: () => {
            return get();
        },

        isValid: () => {
            const { firstName, lastName, gender, dateOfBirth } = get();
            return Boolean(firstName && lastName && gender && dateOfBirth);
        },
    }),
);
