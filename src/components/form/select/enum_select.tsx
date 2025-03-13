import React, { JSX } from 'react';
import { Select, SelectProps } from 'antd';

// Generic interface for enum select props
interface EnumSelectProps<T extends object> extends Omit<SelectProps<string | number | boolean>, 'options'> {
    /**
     * The enum type to create options from
     */
    enumType: T;

    /**
     * Transform function to customize the display value (optional)
     */
    transformLabel?: (key: keyof T, value: T[keyof T]) => string;

    /**
     * Whether to use the enum's value instead of its key (default: true)
     */
    useValue?: boolean;
}

/**
 * A select component that automatically creates options from an enum type.
 * This component supports both numeric enums and string literal enums.
 */
export const EnumSelect = <T extends object>({
    enumType,
    transformLabel,
    useValue = true,
    ...props
}: EnumSelectProps<T>): JSX.Element => {
    const options = React.useMemo(() => {
        return Object.entries(enumType)
            // Filter out numeric keys that TypeScript adds to numeric enums
            .filter(([key]) => isNaN(Number(key)))
            .map(([key, value]) => ({
                label: transformLabel ? transformLabel(key as keyof T, value as T[keyof T]) : key,
                value: useValue ? value : key,
            }));
    }, [enumType, transformLabel, useValue]);

    return (
        <Select
            allowClear
            style={{ width: '100%' }}
            options={options}
            {...props}
        />
    );
};

export default EnumSelect;