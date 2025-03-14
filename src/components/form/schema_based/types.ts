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
