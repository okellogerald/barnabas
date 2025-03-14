import { create } from "zustand";
import { ContactInfo, DEFAULT_CONTACT_INFO } from "../schemas/schemas.contact";

/**
 * Contact information actions
 */
export interface ContactInfoActions {
    // Set a specific field
    setField: <K extends keyof ContactInfo>(
        key: K,
        value: ContactInfo[K],
    ) => void;

    // Set multiple fields at once
    setFields: (fields: Partial<ContactInfo>) => void;

    // Reset the contact information state
    reset: () => void;

    // Get all contact information
    getContactInfo: () => ContactInfo;

    // Check if required fields are filled
    isValid: () => boolean;
}

/**
 * Initial contact information state
 */
const initialState: ContactInfo = DEFAULT_CONTACT_INFO;

/**
 * Create the contact information store
 */
export const useContactInfoStore = create<
    ContactInfo & ContactInfoActions
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

        getContactInfo: () => {
            return get();
        },

        isValid: () => {
            const { phoneNumber } = get();
            return Boolean(phoneNumber);
        },
    }),
);
