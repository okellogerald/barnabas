import { z } from "zod";
import { Rule } from "antd/es/form";

/**
 * Utilities for working with Zod schemas and Ant Design form validation
 */
export const ZodFormUtils = {
    /**
     * Creates a type-safe function to get field descriptions from a Zod object schema.
     *
     * @template T - The type of the Zod object schema
     * @param {T} schema - The Zod object schema containing field descriptions
     * @returns A function that retrieves the description for a given field in the schema
     */
    createDescriptionGetter<T extends z.ZodObject<any>>(schema: T) {
        return function getDescription<K extends keyof z.infer<T>>(
            field: K,
        ): string {
            return (schema.shape as any)[field as string]?._def?.description ??
                "";
        };
    },

    /**
     * Convert a Zod schema to Ant Design form validation rules
     *
     * @param schema The Zod schema for a field
     * @returns An array of Ant Design form validation rules
     */
    zodToAntValidation(schema: z.ZodTypeAny): Rule[] {
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
    },

    /**
     * Extracts validation rules for each field in a Zod object schema
     *
     * @param schema The Zod object schema
     * @returns A record of field names to validation rules
     */
    createFormValidation<T extends z.ZodObject<any>>(
        schema: T,
    ): Record<keyof z.infer<T>, Rule[]> {
        const result: Record<string, Rule[]> = {};

        for (const [key, fieldSchema] of Object.entries(schema.shape)) {
            result[key] = ZodFormUtils.zodToAntValidation(
                fieldSchema as z.ZodTypeAny,
            );
        }

        return result as Record<keyof z.infer<T>, Rule[]>;
    },

    /**
     * Extracts all fields with default values from a Zod schema and returns
     * an object mapping field names to their default values.
     *
     * Only fields explicitly defined with `.default()` will be included.
     * Fields that are simply optional (`.optional()`) without a default are ignored.
     *
     * @template T - The shape of the Zod object schema.
     * @param {z.ZodObject<T>} schema - The Zod object schema to extract defaults from.
     * @returns {Partial<z.infer<z.ZodObject<T>>>} An object containing only the fields with default values.
     *
     * @example
     * const schema = z.object({
     *   name: z.string().default("Unknown"),
     *   age: z.number(),
     *   isActive: z.boolean().default(true),
     * });
     *
     * const defaults = getDefaultsFromSchema(schema);
     * // defaults = { name: "Unknown", isActive: true }
     */
    getDefaultsFromSchema<T extends z.ZodRawShape>(
        schema: z.ZodObject<T>,
    ): Partial<z.infer<z.ZodObject<T>>> {
        const defaults: any = {};

        for (const [key, value] of Object.entries(schema.shape)) {
            if (value instanceof z.ZodDefault) {
                defaults[key] = value._def.defaultValue();
            }
        }

        return defaults;
    },
};
