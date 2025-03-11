import { FormRowProps, VerticalFormRowProps } from "./types";
import { Form, Row, Col } from "antd";

export const FormRow = <T,>({ fields, fieldDefinitions, columnSpan = 8 }: FormRowProps<T>) => {
    return (
        <Row gutter={24}>
            {fields.map((fieldName, i) => {
                const { render, ...fieldProps } = fieldDefinitions[fieldName];
                return (
                    <Col key={i} span={columnSpan}>
                        <Form.Item key={fieldName.toString()} {...fieldProps}>
                            {render()}
                        </Form.Item>
                    </Col>
                );
            })}
        </Row>
    );
};

export const VerticalFormRow = <T,>({ field, fieldName, columnSpan = 24 }: VerticalFormRowProps<T>) => {
    const { render, ...fieldProps } = field
    return (
        <Row gutter={24}>
            <Col key={`col-${fieldName.toString()}`} span={columnSpan}>
                <Form.Item key={fieldName.toString()} {...fieldProps}>
                    {render()}
                </Form.Item>
            </Col>
        </Row>
    );
};
