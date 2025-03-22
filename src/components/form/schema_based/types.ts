import { FormInstance } from "antd";
import { Rule } from "antd/es/form";
import { ReactNode } from "react";

/**
 * Form field definition - Updated to be more compatible with Ant Design
 */
export interface SchemaFormFieldDefinition<T, K extends keyof T = keyof T> {
    label?: ReactNode; // Made optional to match FormItemProps
    name: K;
    rules?: Rule[]; // Made optional with ? to match FormItemProps
    valuePropName?: string;
    render: () => ReactNode;
}

/**
 * Form fields map type
 */
export type SchemaFormFieldsMap<T, K extends keyof T = keyof T> = Record<
    K,
    SchemaFormFieldDefinition<T, K>
>;

/**
 * Form structure definition for layout
 */
export interface SchemaFormStructure<T, K extends keyof T = keyof T> {
    rows: Record<string, K[]>;
    span: number;
}

/**
 * Form section props
 */
export interface SchemaFormSectionProps<T, K extends keyof T = keyof T> {
    form: FormInstance<T>;
    formFields: SchemaFormFieldsMap<T, K>;
    formStructure: SchemaFormStructure<T, K>;
    title: string;
    description?: string;
    footer?: ReactNode;
}

/**
 * Form field definition - Updated to be more compatible with Ant Design
 */
export interface SchemaFormFieldDefinition<T, K extends keyof T = keyof T> {
    label?: ReactNode; // Made optional to match FormItemProps
    name: K;
    rules?: Rule[]; // Made optional with ? to match FormItemProps
    valuePropName?: string;
    getValueProps?: (value: any) => Record<string, any>;
    // Modified to support dynamic props
    render: () => ReactNode;
}

/**
 * Form structure definition for layout
 */
export interface SchemaFormStructure<T, K extends keyof T = keyof T> {
    rows: Record<string, K[]>;
    span: number;
}

/**
 * Form structure definition for layout
 */
export interface SchemaFormStructure<T, K extends keyof T = keyof T> {
    rows: Record<string, K[]>;
    span: number;
}

/**
 * Enhanced props for SchemaFormSection component with registry support
 */
export interface EnhancedSchemaFormSectionProps<T, K extends keyof T = keyof T> {
    // Form instance
    form: FormInstance;

    // Title for the section
    title: ReactNode;

    // Optional description
    description?: ReactNode;

    // Fields to include - can be array of field definitions or a record of field definitions
    fields: SchemaFormFieldDefinition<T, K>[] | Record<string, SchemaFormFieldDefinition<T, K>>;

    // Layout definition (row-based)
    layout?: {
        rows: Record<string, K[]>;
        span?: number; // Default column span
    };

    // Footer content (optional)
    footer?: ReactNode;
}