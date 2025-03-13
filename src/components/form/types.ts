import { FormInstance, FormProps } from "antd";
import { ReactNode } from "react";

/**
 * Represents a form field with render function and additional properties.
 * @interface FormField
 */
export interface FormField {
    /**
     * Function that returns the ReactNode to render this field.
     * @returns {ReactNode} The rendered form field.
     */
    render: () => ReactNode;

    /**
     * Additional properties that can be attached to a form field.
     * @type {any}
     */
    [key: string]: any;
}

/**
 * Defines the layout structure of a form.
 * Keys represent row identifiers and values are arrays of field names.
 * @interface DMPFormLayout
 */
export interface DMPFormLayout<T> {
    /**
     * Keys are row identifiers, values are arrays of field names.
     */
    rows: Record<string, Array<keyof T>>;
    span?: number;
}

/**
 * Enumeration of possible positions for the submit button.
 * @enum {number}
 */
export enum SubmitButtonPosition {
    /**
     * Places the submit button at the bottom of the form, taking full width (DEFAULT).
     */
    BOTTOM_FILL,

    /**
     * Places the submit button at the bottom right of the form.
     */
    BOTTOM_RIGHT,

    /**
     * Places the submit button at the bottom left of the form.
     */
    BOTTOM_LEFT,

    /**
     * Places the submit button at the top right of the form.
     * Recommended for long forms.
     *
     * Will apply only when the form-header is not provided
     */
    TOP_RIGHT,
}

/**
 * Props for the Tembo Form component.
 * @interface TemboFormProps
 * @template T - Type of form values.
 * @extends {Omit<FormProps, "onFinish">}
 */
export interface TemboFormProps<T = any> extends Omit<FormProps, "onFinish"> {
    /**
     * Form fields definition.
     * Keys are field names and values are FormField objects.
     */
    formFields: Record<keyof T, FormField>;

    /**
     * Form structure defined in rows.
     * Keys are row identifiers and values are arrays of field names.
     */
    formStructure?: DMPFormLayout<T>;

    /**
     * Form Antd Instance.
     * Contains all important information about the form.
     */
    form?: FormInstance<T>;

    /**
     * Form title to be displayed at the top of the form.
     */
    title?: string;

    /**
     * Form description text to be displayed below the title.
     */
    description?: string;

    /**
     * Custom form footer.
     * If not provided, a default submit button will be used.
     */
    footer?: ReactNode;

    /**
     * Custom form header.
     * If not provided, title and description will be used to form a default header.
     */
    header?: ReactNode;

    /**
     * Configuration for the default submit button.
     * Only used when a custom footer is not provided.
     */
    submitButtonProps?: {
        /**
         * Whether the submit button should show a loading state.
         */
        loading?: boolean;

        /**
         * Position of the submit button within the form.
         */
        position?: SubmitButtonPosition;
    };

    /**
     * Handler function called when the form is submitted.
     * @param {T} values - The values from the form submission.
     * @returns {Promise<void> | void} - Can return a Promise for async operations.
     */
    onFinish?: (values: T) => Promise<void> | void;
}

/**
 * Represents a section within a form.
 * @interface FormSection
 */
export interface FormSection {
    /**
     * Title of the section.
     */
    title: string;

    /**
     * Array of field names to be included in this section.
     */
    fields: string[];

    /**
     * Optional description for the section.
     */
    description?: string;

    /**
     * Optional extra content to be displayed in the section header.
     */
    extra?: ReactNode;
}

/**
 * Defines the layout structure of a form with sections.
 * Keys represent section identifiers and values are FormSection objects.
 * @interface SectionedFormLayout
 */
export interface SectionedFormLayout {
    /**
     * Keys are section identifiers, values are FormSection objects.
     */
    [sectionKey: string]: FormSection;
}

/**
 * Props for the Sectioned Form component.
 * Extends TemboFormProps but replaces formStructure with a sectioned layout.
 * @interface SectionedFormProps
 * @template T - Type of form values.
 * @extends {Omit<TemboFormProps<T>, "formStructure">}
 */
export interface SectionedFormProps<T = any>
    extends Omit<TemboFormProps<T>, "formStructure"> {
    /**
     * Form structure defined as sections.
     * Keys are section identifiers and values are FormSection objects.
     */
    formStructure: SectionedFormLayout;
}

/**
 * Props for the Form Section component.
 * @interface FormSectionProps
 */
export interface FormSectionProps {
    /**
     * Title of the section.
     */
    title: string;

    /**
     * Optional description for the section.
     */
    description?: string;

    /**
     * Optional extra content to be displayed in the section header.
     */
    extra?: ReactNode;

    /**
     * Child components to be rendered within the section.
     */
    children: ReactNode;
}

/**
 * Props for the Form Row component.
 * @interface FormRowProps
 */
export interface FormRowProps<T> {
    /**
     * Array of field names to be included in this row.
     */
    fields: Array<keyof T>;

    /**
     * Definitions of all fields in the form.
     * Keys are field names and values are FormField objects.
     */
    fieldDefinitions: Record<keyof T, FormField>;

    /**
     * Optional column span for controlling the width of fields in this row.
     */
    columnSpan?: number;
}

/**
 * Props for the Vertical Form Row component.
 * @interface VerticalFormRowProps
 */
export interface VerticalFormRowProps<T> {
    /**
     * Name of the field.
     */
    fieldName: keyof T;

    /**
     * Definition of the field.
     */
    field: FormField;

    /**
     * Optional column span for controlling the width of the field.
     */
    columnSpan?: number;
}
