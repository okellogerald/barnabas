import { z } from "zod";
import { Rule } from "antd/es/form";

/**
 * Creates a type-safe function to get field descriptions from a Zod object schema.
 *
 * @template T - The type of the Zod object schema
 * @param {T} schema - The Zod object schema containing field descriptions
 * @returns {<K extends keyof z.infer<T>>(field: K) => string} A function that retrieves
 *          the description for a given field in the schema
 */
export function createDescriptionGetter<T extends z.ZodObject<any>>(schema: T) {
    return function getDescription<K extends keyof z.infer<T>>(
        field: K,
    ): string {
        return (schema.shape as any)[field as string]?._def?.description ?? "";
    };
}

/**
 * Convert a Zod schema to Ant Design form validation rules
 *
 * @param schema The Zod schema for a field
 * @returns An array of Ant Design form validation rules
 */
export function zodToAntValidation(schema: z.ZodTypeAny): Rule[] {
    const rules: Rule[] = [];

    // Check if field is required
    if (!schema.isOptional()) {
        rules.push({
            required: true,
            message: "This field is required",
        });
    }

    // Handle string-specific validations
    if (schema instanceof z.ZodString) {
        // Add email validation
        if (schema._def.checks?.some((check) => check.kind === "email")) {
            rules.push({
                type: "email",
                message: "Please enter a valid email address",
            });
        }

        // Add min/max length validations
        schema._def.checks?.forEach((check) => {
            if (check.kind === "min") {
                rules.push({
                    min: check.value,
                    message: `Must be at least ${check.value} characters`,
                });
            }
            if (check.kind === "max") {
                rules.push({
                    max: check.value,
                    message: `Must be at most ${check.value} characters`,
                });
            }
        });
    }

    return rules;
}

/**
 * Extracts validation rules for each field in a Zod object schema
 *
 * @param schema The Zod object schema
 * @returns A record of field names to validation rules
 */
export function createFormValidation<T extends z.ZodObject<any>>(
    schema: T,
): Record<keyof z.infer<T>, Rule[]> {
    const result: Record<string, Rule[]> = {};

    for (const [key, fieldSchema] of Object.entries(schema.shape)) {
        result[key] = zodToAntValidation(fieldSchema as z.ZodTypeAny);
    }

    return result as Record<keyof z.infer<T>, Rule[]>;
}

/**
 * Get the default values from a Zod schema
 *
 * @param schema The Zod object schema
 * @returns An object with default values for fields that have them
 */
export function getSchemaDefaults<T extends z.ZodObject<any>>(
    schema: T,
): Partial<z.infer<T>> {
    const defaults: Record<string, any> = {};

    for (const [key, fieldSchema] of Object.entries(schema.shape)) {
        const defaultValue = (fieldSchema as any)._def?.defaultValue?.();
        if (defaultValue !== undefined) {
            defaults[key] = defaultValue;
        }
    }

    return defaults as Partial<z.infer<T>>;
}
