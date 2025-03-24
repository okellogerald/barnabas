import { ContactInfoKeys } from '../types';
import { MemberEditContactInfo, MemberEditContactInfoSchema } from '../schemas/schemas.contact';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { Member } from '@/models';

/**
 * Hook to create and setup contact form fields
 */
export const useContactFields = (member?: Member) => {
    const [form] = Form.useForm<MemberEditContactInfo>();
    const builder = useSchemaFormBuilder(MemberEditContactInfoSchema)

    // Create initial values object
    const initialValues: Partial<MemberEditContactInfo> = {
        phoneNumber: member?.phoneNumber,
        email: member?.email,
        residenceNumber: member?.residenceNumber,
        residenceBlock: member?.residenceBlock,
        postalBox: member?.postalBox,
        residenceArea: member?.residenceArea,
    };

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Contact fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Contact fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberEditContactInfo, ContactInfoKeys> => {

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