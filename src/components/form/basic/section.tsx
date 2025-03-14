import React from 'react';
import { DMPForm } from './form';
import { FormField, DMPFormLayout, TemboFormProps } from './types';
import { FormInstance } from 'antd';

/**
 * Props for the DMPFormSection component.
 * @interface DMPFormSectionProps
 * @template T - Type of the complete form values.
 * @template K - Type of keys for this section (must be keys of T).
 */
export interface DMPFormSectionProps<T extends object, K extends keyof T> {
    /**
     * Form Antd Instance - should be shared across all sections.
     */
    form: FormInstance<T>;

    /**
     * Form fields definition for this section.
     * Keys are field names for this section only.
     */
    formFields: Record<K, FormField>;

    /**
     * Form structure defined in rows for this section.
     * Keys are row identifiers and values are arrays of field names.
     */
    formStructure?: Omit<DMPFormLayout<T>, 'rows'> & {
        rows: Record<string, Array<K>>;
    };

    /**
     * Section title to be displayed at the top of the form.
     */
    title?: string;

    /**
     * Section description text to be displayed below the title.
     */
    description?: string;

    /**
     * Custom section footer.
     */
    footer?: React.ReactNode;

    /**
     * Submit button props - typically not needed in a section unless it's the final one.
     */
    submitButtonProps?: TemboFormProps<T>['submitButtonProps'];
}

/**
 * A component that renders a section of a larger form.
 * Allows specifying only the fields relevant to this section.
 */
export const DMPFormSection = <T extends object, K extends keyof T>({
    form,
    formFields,
    formStructure,
    title,
    description,
    footer,
    submitButtonProps,
}: DMPFormSectionProps<T, K>) => {
    // Convert the section structure to a full structure expected by TemboForm
    // This maintains type safety while allowing partial fields
    const convertedStructure: DMPFormLayout<T> | undefined = formStructure
        ? {
            span: formStructure.span,
            rows: formStructure.rows as unknown as Record<string, Array<keyof T>>,
        }
        : undefined;

    // Create a type-safe wrapper around formFields to satisfy TemboForm's requirements
    // This is just for type compatibility, the actual rendered fields are only those in formFields
    const convertedFields = formFields as unknown as Record<keyof T, FormField>;

    return (
        <DMPForm<T>
            form={form}
            formFields={convertedFields}
            formStructure={convertedStructure}
            title={title}
            description={description}
            footer={footer}
            submitButtonProps={submitButtonProps}
            // Disable the actual form submission as that will be handled by the parent
            onFinish={undefined}
        />
    );
};

export default DMPFormSection;