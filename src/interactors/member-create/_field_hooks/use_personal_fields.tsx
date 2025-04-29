import { Gender } from '@/constants';
import { PersonalInfoKeys } from '../types';
import { MemberCreatePersonalInfoSchema, MemberCreatePersonalInfo } from '../schemas/schemas.personal';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { ZodFormUtils } from '@/utilities';

/**
 * Hook to create and setup personal form fields
 */
export const usePersonalFields = () => {
    const [form] = Form.useForm<MemberCreatePersonalInfo>();
    const builder = useSchemaFormBuilder(MemberCreatePersonalInfoSchema)
    const initialValues = ZodFormUtils.getDefaultsFromSchema(MemberCreatePersonalInfoSchema)

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Personal fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Personal fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreatePersonalInfo, PersonalInfoKeys> => {
        return {
            envelopeNumber: builder.createTextField('envelopeNumber'),
            firstName: builder.createTextField('firstName'),
            middleName: builder.createTextField('middleName'),
            lastName: builder.createTextField('lastName'),
            gender: builder.createEnumSelectField('gender', Gender, {
                placeholder: "Select gender"
            }),
            dateOfBirth: builder.createDateField('dateOfBirth'),
            placeOfBirth: builder.createTextField('placeOfBirth'),
            profilePhoto: builder.createURLField('profilePhoto'),
        };
    }, []);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['firstName', 'middleName', 'lastName'] as PersonalInfoKeys[],
                row2: ['gender', 'dateOfBirth', 'placeOfBirth'] as PersonalInfoKeys[],
                row3: ['envelopeNumber', 'profilePhoto'] as PersonalInfoKeys[],
            },
            span: 8, // 3 fields per row (24/3=8)
        },
        onFieldsChange: changeHandler,
        initialValues
    };
};