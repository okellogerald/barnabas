import { z } from 'zod';
import { DatePicker, Input, InputNumber, FormItemProps, Switch } from 'antd';
import { Rule, RuleObject } from 'antd/es/form';
import dayjs from 'dayjs';
import { EnumSelect } from '@/components/form';
import { SchemaFormFieldDefinition } from './types';
import { useRef } from 'react';
import React from 'react';

/**
 * Type guard to check if a rule is a RuleObject (not a RuleRender function)
 */
function isRuleObject(rule: Rule): rule is RuleObject {
    return typeof rule !== 'function' && rule !== undefined;
}

/**
 * SchemaFormBuilder - A unified form builder that combines Zod schemas with field generation
 */
export class SchemaFormBuilder<T extends z.ZodObject<any>> {
    private schema: T;
    private descriptions: Record<string, string>;

    constructor(schema: T) {
        this.schema = schema;
        this.descriptions = this.extractDescriptions(schema);
    }

    private extractDescriptions(schema: z.ZodObject<any>): Record<string, string> {
        const descriptions: Record<string, string> = {};

        for (const [key, field] of Object.entries(schema.shape)) {
            descriptions[key] = (field as any)._def?.description || '';
        }

        return descriptions;
    }

    private isFieldRequired(fieldName: string): boolean {
        const field = this.schema.shape[fieldName] as z.ZodTypeAny;
        return !field.isOptional();
    }

    /**
     * Check if rule array already contains a rule with specific property
     * @param rules The array of rules to check
     * @param property The property to check for (like 'type', 'pattern', etc.)
     * @param value Optional specific value to match
     */
    private hasRuleWithProperty(rules: Rule[], property: string, value?: any): boolean {
        return rules.some(rule => {
            if (isRuleObject(rule)) {
                const propValue = (rule as any)[property];
                return propValue !== undefined && (value === undefined || propValue === value);
            }
            return false;
        });
    }

    private getValidationRules(fieldName: string): Rule[] {
        const field = this.schema.shape[fieldName] as z.ZodTypeAny;
        const rules: Rule[] = [];

        // Check if field is required
        if (this.isFieldRequired(fieldName)) {
            rules.push({
                required: true,
                message: `${this.descriptions[fieldName] || fieldName} is required`,
            });
        }

        // Add type-specific validations
        if (field instanceof z.ZodString) {
            // Add string validations (email, min/max length, etc.)
            field._def.checks?.forEach(check => {
                if (check.kind === 'email') {
                    rules.push({
                        type: 'email',
                        message: 'Please enter a valid email address',
                    } as RuleObject);
                }

                if (check.kind === 'min') {
                    rules.push({
                        min: check.value,
                        message: `Must be at least ${check.value} characters`,
                    } as RuleObject);
                }

                if (check.kind === 'max') {
                    rules.push({
                        max: check.value,
                        message: `Must be at most ${check.value} characters`,
                    } as RuleObject);
                }

                if (check.kind === 'regex') {
                    rules.push({
                        pattern: check.regex,
                        message: check.message || 'Invalid format',
                    } as RuleObject);
                }
            });
        }

        return rules;
    }

    private getPlaceholder(fieldName: string): string {
        return this.descriptions[fieldName] || `Enter ${fieldName}`;
    }

    private toTitleCase(str: string): string {
        const spaced = str.replace(/([A-Z])/g, ' $1');
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

    private convertToFormFieldDefinition<K extends keyof z.infer<T>>(
        props: FormItemProps<any>,
        renderFn: () => React.ReactNode
    ): SchemaFormFieldDefinition<z.infer<T>, K> {
        return {
            ...props,
            name: props.name as K,
            render: renderFn
        };
    }

    createTextField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                data-testid={`${name}-input`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a text area field based on schema
     */
    createTextAreaField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
        rows?: number;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input.TextArea
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                rows={config.rows || 3}
                data-testid={`${name}-textarea`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a number field based on schema
     */
    createNumberField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <InputNumber
                style={{ width: '100%' }}
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                data-testid={`${name}-input`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a date field based on schema
     */
    createDateField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules,
            getValueProps: (value) => ({
                value: value ? dayjs(value) : undefined,
            })
        };

        const renderFn = () => (
            <DatePicker
                style={{ width: '100%' }}
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                data-testid={`${name}-date-picker`}
                minDate={dayjs(new Date(1800))}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    createEmailField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        // Ensure email validation is included using our helper method
        if (!this.hasRuleWithProperty(rules, 'type', 'email')) {
            rules.push({
                type: 'email',
                message: 'Please enter a valid email address',
            } as RuleObject);
        }

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input
                type="email"
                disabled={config.disabled}
                placeholder={config.placeholder || 'Enter email'}
                data-testid={`${name}-input`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    createPhoneField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        // Ensure phone validation is included using our helper method
        if (!this.hasRuleWithProperty(rules, 'pattern')) {
            rules.push({
                pattern: /^(?:\+255|0)(?:6[125-9]|7[13-9])\d{7}$/,
                message: 'Please enter a valid phone number',
            } as RuleObject);
        }

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input
                disabled={config.disabled}
                placeholder={config.placeholder || 'Enter phone number (e.g. 0712345678)'}
                data-testid={`${name}-input`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a URL field based on schema
     */
    createURLField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        // Ensure URL validation is included
        if (!this.hasRuleWithProperty(rules, 'url')) {
            rules.push({
                type: 'url',
                message: 'Please enter a valid URL',
            } as RuleObject);
        }

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input
                disabled={config.disabled}
                placeholder={config.placeholder || 'Enter URL'}
                data-testid={`${name}-input`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a boolean/switch field based on schema
     */
    createSwitchField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            valuePropName: 'checked'
        };

        const renderFn = () => (
            <Switch
                disabled={config.disabled}
                data-testid={`${name}-switch`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create an enum select field based on schema
     */
    createEnumSelectField<K extends keyof z.infer<T>, E extends Record<string, any>>(
        fieldName: K,
        enumType: E,
        config: {
            label?: string;
            disabled?: boolean;
            placeholder?: string;
            value?: string | number,
        } = {}
    ): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const value = React.useMemo(() => {
            if (!config.value) return undefined
            return Object.entries(enumType)
                // Filter out numeric keys that TypeScript adds to numeric enums
                .find((e) => e[1] === config.value)?.[1]
        }, [config.value]);

        const renderFn = () => (
            <EnumSelect
                value={value}
                enumType={enumType}
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                data-testid={`${name}-select`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create an amount field based on schema
     */
    createAmountField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
        prefix?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        const formatter = (value: string | number | undefined) => {
            return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        const parser = (value: string | undefined) => {
            return value!.replace(/[^0-9.]/g, '');
        };

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <InputNumber
                prefix={config.prefix || "TZS"}
                style={{ width: "100%" }}
                disabled={config.disabled}
                placeholder={config.placeholder || this.getPlaceholder(name)}
                data-testid={`${name}-input`}
                formatter={formatter}
                parser={parser}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a password field based on schema
     */
    createPasswordField<K extends keyof z.infer<T>>(fieldName: K, config: {
        label?: string;
        disabled?: boolean;
        placeholder?: string;
    } = {}): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;
        const rules = this.getValidationRules(name);

        // Ensure minimum length validation for passwords
        if (!this.hasRuleWithProperty(rules, 'min')) {
            rules.push({
                min: 6,
                message: 'Password must be at least 6 characters',
            } as RuleObject);
        }

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules
        };

        const renderFn = () => (
            <Input.Password
                disabled={config.disabled}
                placeholder={config.placeholder || 'Enter password'}
                data-testid={`${name}-password`}
            />
        );

        return this.convertToFormFieldDefinition(formItemProps, renderFn);
    }

    /**
     * Create a custom field based on provided render function.
     */
    createCustomField<K extends keyof z.infer<T>>(
        fieldName: K,
        render: () => React.ReactNode,
        config: {
            label?: string;
            rules?: FormItemProps['rules'];
        } = {}
    ): SchemaFormFieldDefinition<z.infer<T>, K> {
        const name = fieldName as string;

        const formItemProps: FormItemProps<any> = {
            label: config.label || this.toTitleCase(name),
            name: fieldName,
            rules: config.rules,
        };

        return this.convertToFormFieldDefinition(formItemProps, render);
    }
}

/**
 * Custom hook to create and initialize a SchemaFormBuilder instance
 * 
 * @param schema Zod schema to use for the form builder
 * @param initialValues Optional initial values to set on the builder
 * @returns A reference to the SchemaFormBuilder instance
 */
export function useSchemaFormBuilder<T extends z.ZodObject<any>>(
    schema: T
) {
    // Create a ref to hold the builder instance
    const builderRef = useRef<SchemaFormBuilder<T>>(
        new SchemaFormBuilder(schema)
    );

    // Return the builder instance
    return builderRef.current;
}