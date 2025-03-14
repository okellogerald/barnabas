import { Button, Flex, Form, Typography } from "antd";
import { FormField, SubmitButtonPosition, DMPFormLayout, TemboFormProps } from "./types";
import { FormRow } from "./row";
import React, { CSSProperties } from "react";
import { Header } from "antd/es/layout/layout";

import "../_common/form.css"

const headerStyle: CSSProperties = {
    backgroundColor: "white",
    padding: 0,
}

const titleStyle: CSSProperties = {
    backgroundColor: "white",
    padding: 0,
    height: "fit-content",
    marginBottom: 20,
}

export const DMPForm = <T extends object>({
    title,
    description,
    formFields,
    formStructure,
    form,
    onFinish,
    footer,
    submitButtonProps,
    header,
    ...formProps
}: TemboFormProps<T>) => {
    const layout = formStructure ?? convertToTemboFormLayout(formFields)
    const submitBtnProps = {
        loading: submitButtonProps?.loading ?? false,
        position: submitButtonProps?.position ?? SubmitButtonPosition.BOTTOM_RIGHT
    } as Required<TemboFormProps["submitButtonProps"]>

    return (
        <Form<T>
            title={title}
            form={form}
            onFinish={onFinish}
            layout="vertical"
            {...formProps}
        >
            {/* if header component is provided */}
            {
                header && <Header style={headerStyle}>
                    {header}
                </Header>
            }
            {/* if header component is not provided, but title is provided */}
            {
                !header && title && <Header style={titleStyle}>
                    <Flex justify="space-between" align="end" gap="large">
                        <Flex vertical align="start" justify="start">
                            <Typography.Title level={4}>{title}</Typography.Title>
                            {
                                description && <Typography.Text type={"secondary"}>{description}</Typography.Text>
                            }
                        </Flex>
                        {
                            submitBtnProps?.position === SubmitButtonPosition.TOP_RIGHT && (
                                <SubmitButton
                                    submitButtonProps={submitButtonProps}
                                    form={form}
                                >
                                    Submit
                                </SubmitButton>
                            )
                        }
                    </Flex>
                </Header>
            }
            {
                Object.keys(layout.rows).map((key, index) => (
                    <FormRow
                        key={index}
                        fields={layout.rows[key]}
                        fieldDefinitions={formFields}
                        columnSpan={layout.span}
                    />
                ))
            }
            {footer}
            {
                !footer && submitBtnProps?.position !== SubmitButtonPosition.TOP_RIGHT && (
                    <div className={getClassNameFromLayout(layout)}>
                        <SubmitButton
                            submitButtonProps={submitBtnProps}
                            form={form}
                        >
                            Submit
                        </SubmitButton>
                    </div>
                )
            }
        </Form>
    );
};

// Create a new type combining submitButtonProps and form
export type SubmitButtonProps<T = any> = {
    submitButtonProps: TemboFormProps<T>['submitButtonProps'];
    form?: TemboFormProps<T>['form'];
};

const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({ form, submitButtonProps, children }) => {
    const { loading, position } = submitButtonProps ?? {}
    const bLeft = position === SubmitButtonPosition.BOTTOM_LEFT
    const bRight = position === SubmitButtonPosition.BOTTOM_RIGHT
    const bfull = position === SubmitButtonPosition.BOTTOM_FILL

    const [submittable, setSubmittable] = React.useState<boolean>(false);

    // Watch all values
    const values = Form.useWatch([], form);

    React.useEffect(() => {
        if (form) {
            form
                .validateFields({ validateOnly: true })
                .then(() => setSubmittable(true))
                .catch(() => setSubmittable(false));
        }
    }, [form, values]);

    return (
        <Flex
            justify={bLeft ? "flex-start" : bRight ? "flex-end" : "flex-end"}
        >
            <Button
                style={{ width: bfull ? "100%" : undefined }}
                type="primary"
                loading={loading}
                htmlType="submit"
                disabled={!submittable}
            >
                {children}
            </Button>
        </Flex>
    );
};

/**
 * Generates a single class name for a layout based on the largest number of items in any row.
 * This function computes the span and the maximum number of items (fields) in any row 
 * to generate the appropriate class name for the layout.
 * 
 * Example usage:
 * 
 * const layout = {
 *     rows: {
 *         row1: ["name", "email"],
 *         row2: ["address"],
 *         row3: ["phone", "dob", "gender"]
 *     },
 *     span: 8
 * };
 * 
 * console.log(getClassNameFromLayout(layout)); 
 * // Output: "col-8-3" because row3 has the most fields (3 items).
 * 
 * @param layout - The layout definition, which contains row identifiers and their corresponding field names.
 * @returns The generated class name in the format "col-[span]-[maxItems]".
 */
function getClassNameFromLayout<T>(layout: DMPFormLayout<T>): string {
    if (!layout.rows || Object.keys(layout.rows).length === 0) {
        throw new Error("Layout must contain at least one row.");
    }

    // Find the row with the maximum number of fields
    const maxItemsRow = Object.values(layout.rows).reduce((maxRow, fields) => {
        return fields.length > maxRow.length ? fields : maxRow;
    });

    const span = layout.span ?? 24; // Default to 24 if span is not defined
    const maxItems = maxItemsRow.length;

    return `col-${span}-${maxItems}`;
}

/**
 * Converts form fields to TemboFormLayout.
 * @param formFields - The form fields to convert.
 * @returns The converted TemboFormLayout.
 */
function convertToTemboFormLayout<T>(formFields: Record<keyof T, FormField>): DMPFormLayout<T> {
    const rows: Record<string, Array<keyof T>> = {};
    Object.keys(formFields).forEach((key, index) => {
        rows[`row${index + 1}`] = [key as keyof T];
    });
    return { rows, span: 24 };
}