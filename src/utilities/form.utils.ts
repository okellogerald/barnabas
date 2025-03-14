import { FormFieldBuilder } from "@/components/form";
import { FormInstance } from "antd";

/**
 * Form validation state
 */
export enum FORM_STATE {
    UNTOUCHED = "untouched",
    VALIDATING = "validating",
    VALID = "valid",
    INVALID = "invalid",
}

/**
 * Form error message for API errors
 */
export interface FormErrorRecord {
    name: string[];
    fields: Record<string, string[]>;
}

/**
 * Form utility functions
 */
export const formUtils = {
    /**
     * Sets API errors on a form
     * @param form The form instance
     * @param errors Error object from API
     */
    setErrors(
        form: FormInstance,
        errors: Record<string, string | string[]>,
    ): void {
        const fieldErrors: Record<string, { errors: string[] }> = {};

        // Process each error
        Object.entries(errors).forEach(([field, error]) => {
            // Convert string error to array
            const errorArray = Array.isArray(error) ? error : [error];

            // Map field name if needed
            const formField = field;

            // Set the error for this field
            fieldErrors[formField] = { errors: errorArray };
        });

        // Set all errors on the form
        form.setFields(
            Object.entries(fieldErrors).map(([name, obj]) => ({
                name: form.getFieldInstance(name) ? name : name.split("."),
                errors: obj.errors,
            })),
        );
    },

    /**
     * Resets a form to its initial values
     * @param form The form instance
     */
    resetForm(form: FormInstance): void {
        form.resetFields();
    },

    /**
     * Converts an API error object to form errors
     * @param error API error object
     * @returns Formatted error object for setErrors
     */
    formatApiErrors(error: any): Record<string, string[]> {
        const result: Record<string, string[]> = {};

        if (!error || typeof error !== "object") {
            return result;
        }

        // Handle standard API error format
        if (error.message && typeof error.message === "object") {
            Object.entries(error.message).forEach(([key, value]) => {
                result[key] = Array.isArray(value) ? value : [value as string];
            });
            return result;
        }

        // Handle array of messages
        if (error.message && Array.isArray(error.message)) {
            result._error = error.message;
            return result;
        }

        // Handle simple string error
        if (error.message && typeof error.message === "string") {
            result._error = [error.message];
            return result;
        }

        return result;
    },

    /**
     * Converts form values to proper format for the API
     * @param values Form values
     * @returns Formatted values for API
     */
    prepareValues<T>(values: T): T {
        // Create a copy of the values
        const result = { ...values } as any;

        // Process each value
        Object.entries(result).forEach(([key, value]) => {
            // Convert empty strings to null
            if (value === "") {
                result[key] = null;
            }

            // Convert empty arrays to undefined
            if (Array.isArray(value) && value.length === 0) {
                result[key] = undefined;
            }

            // Handle Date objects
            if (value instanceof Date) {
                result[key] = value.toISOString();
            }
        });

        return result;
    },

    /**
     * Creates a FormFieldBuilder for a specific form type
     * @returns A new FormFieldBuilder instance
     */
    createBuilder<T extends object>(): FormFieldBuilder<T> {
        return new FormFieldBuilder<T>();
    },
};
