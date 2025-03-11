import { DatePicker, Input, FormItemProps, InputNumber } from "antd";
import { Rule } from "antd/es/form";
import dayjs from "dayjs";

interface BaseFieldConfig {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * A builder class for creating form field configurations.
 * @template T - The type of the form data object.
 */
export class FormFieldBuilder<T extends object> {
    private createField(
        config: Omit<FormItemProps<T>, 'children'> & {
            render: () => React.ReactNode;
        }
    ): FormItemProps<T> & { render: () => React.ReactNode } {
        return config;
    }

    private createRequiredRule(message?: string): Rule {
        return {
            required: true,
            message: message || "This field is required"
        };
    }

    /**
     * Creates a text input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createTextField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule());
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            initialValue: config.initialValue,
            rules: [
                ...rules,
                { type: "string" }
            ],
            render: () => (
                <Input
                    disabled={config.disabled}
                    placeholder={config.placeholder}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }

    /**
     * Creates a number input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createNumberField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule());
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            initialValue: config.initialValue,
            rules: [
                ...rules,
                { type: "number" }
            ],
            render: () => (
                <InputNumber
                    style={{ width: "100%" }}
                    disabled={config.disabled}
                    placeholder={config.placeholder}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }


    /**
         * Creates an amount input field configuration.
         * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }} config - The field configuration.
         * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
         */
    createAmountField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T, initialValue?: any }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule());
        }

        const formatter = (value: string | number | undefined) => {
            return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        const parser = (value: string | undefined) => {
            return value!.replace(/[^0-9.]/g, '');
        };

        return this.createField({
            label: config.label,
            name: config.name as any,
            initialValue: config.initialValue,
            rules: [
                ...rules,
            ],
            render: () => (
                <InputNumber
                    prefix={"TZS"}
                    style={{ width: "100%" }}
                    disabled={config.disabled}
                    placeholder={config.placeholder}
                    data-testid={`${String(config.name)}-input`}
                    formatter={formatter}
                    parser={parser}
                />
            )
        });
    }

    /**
     * Creates a text area field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T, rows?: number }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createTextAreaField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T, rows?: number }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule());
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                { type: "string" }
            ],
            render: () => (
                <Input.TextArea
                    disabled={config.disabled}
                    rows={config?.rows}
                    placeholder={config.placeholder}
                    data-testid={`${String(config.name)}-textarea`}
                />
            )
        });
    }

    /**
     * Creates a date picker field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createDateField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule());
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                { type: "date" }
            ],
            getValueProps: (value) => ({
                value: value ? dayjs(value) : undefined,
                placeholder: config.placeholder || "Select date"
            }),
            render: () => (
                <DatePicker
                    style={{ width: "100%" }}
                    disabled={config.disabled}
                    data-testid={`${String(config.name)}-date-picker`}
                />
            )
        });
    }

    /**
     * Creates an email input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createEmailField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule("Email is required"));
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                {
                    type: "email",
                    message: "Please enter a valid email address"
                }
            ],
            render: () => (
                <Input
                    type="email"
                    disabled={config.disabled}
                    placeholder={config.placeholder || "Enter email"}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }

    /**
     * Creates an password input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createPasswordField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule("Email is required"));
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                {
                    min: 5,
                    message: "Password should have at least 5 characters"
                }
            ],
            render: () => (
                <Input.Password
                    type="password"
                    disabled={config.disabled}
                    placeholder={config.placeholder || "Enter password"}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }

    /**
     * Creates a phone number input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createPhoneField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule("Phone number is required"));
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                {
                    // pattern: /^[+]?[\d\s-()]*$/,
                    pattern: /^\+[1-9]\d{0,2}([-\s]?\d{1,4}){2,4}$/,
                    message: "Please enter a valid phone number"
                }
            ],
            render: () => (
                <Input
                    disabled={config.disabled}
                    placeholder={config.placeholder || "Enter phone number"}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }

    /**
     * Creates a URL input field configuration.
     * @param {Omit<BaseFieldConfig, 'name'> & { name: keyof T }} config - The field configuration.
     * @returns {FormItemProps<T> & { render: () => React.ReactNode }} The field configuration with render function.
     */
    createURLField(config: Omit<BaseFieldConfig, 'name'> & { name: keyof T }): FormItemProps<T> & { render: () => React.ReactNode; } {
        const rules: Rule[] = [];
        if (config.required) {
            rules.push(this.createRequiredRule("URL is required"));
        }

        return this.createField({
            label: config.label,
            name: config.name as any,
            rules: [
                ...rules,
                {
                    type: "url",
                    message: "Please enter a valid URL"
                }
            ],
            render: () => (
                <Input
                    disabled={config.disabled}
                    placeholder={config.placeholder || "Enter URL"}
                    data-testid={`${String(config.name)}-input`}
                />
            )
        });
    }
}