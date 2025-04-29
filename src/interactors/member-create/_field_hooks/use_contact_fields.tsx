import { ContactInfoKeys } from '../types';
import { MemberCreateContactInfoSchema, MemberCreateContactInfo } from '../schemas/schemas.contact';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { ZodFormUtils } from '@/utilities/zod.utils';

/**
 * Hook to create and setup contact form fields
 */
export const useContactFields = () => {
    const [form] = Form.useForm<MemberCreateContactInfo>();
    const builder = useSchemaFormBuilder(MemberCreateContactInfoSchema)
    const initialValues = ZodFormUtils.getDefaultsFromSchema(MemberCreateContactInfoSchema)

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Contact fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Contact fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreateContactInfo, ContactInfoKeys> => {

        return {
            phoneNumber: builder.createPhoneField('phoneNumber'),
            email: builder.createEmailField('email'),
            residenceNumber: builder.createTextField('residenceNumber'),
            residenceBlock: builder.createTextField('residenceBlock'),
            postalBox: builder.createTextField('postalBox'),
            residenceArea: builder.createTextField('residenceArea'),
        };
    }, []);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['phoneNumber', 'email'] as ContactInfoKeys[],
                row2: ['residenceNumber', 'residenceBlock'] as ContactInfoKeys[],
                row3: ['postalBox', 'residenceArea'] as ContactInfoKeys[],
            },
            span: 8, // 3 fields per row (24/3=8)
        },
        onFieldsChange: changeHandler,
        initialValues
    };
};