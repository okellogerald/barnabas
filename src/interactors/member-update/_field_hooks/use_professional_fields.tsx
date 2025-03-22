import { EducationLevel } from '@/constants';
import { ProfessionalInfoKeys } from '../types';
import { MemberCreateProfessionalInfoSchema, MemberCreateProfessionalInfo } from '../schemas/schemas.professional';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";

/**
 * Hook to create and setup professional form fields
 */
export const useProfessionalFields = () => {
    const [form] = Form.useForm<MemberCreateProfessionalInfo>();
    const builder = useSchemaFormBuilder(MemberCreateProfessionalInfoSchema)


    // Create initial values object
    const initialValues: Partial<MemberCreateProfessionalInfo> = {
        // occupation: sampleMember.occupation,
        // placeOfWork: sampleMember.placeOfWork,
        // educationLevel: sampleMember.educationLevel || EducationLevel.Primary,
        // profession: sampleMember.profession,
    };

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Professional fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Professional fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreateProfessionalInfo, ProfessionalInfoKeys> => {
        return {
            occupation: builder.createTextField('occupation'),
            placeOfWork: builder.createTextField('placeOfWork'),
            educationLevel: builder.createEnumSelectField('educationLevel', EducationLevel, {
                placeholder: "Select education level"
            }),
            profession: builder.createTextField('profession'),
        };
    }, []);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['occupation', 'placeOfWork'] as ProfessionalInfoKeys[],
                row2: ['educationLevel', 'profession'] as ProfessionalInfoKeys[],
            },
            span: 8, // 3 fields per row (24/3=8)
        },
        onFieldsChange: changeHandler,
        initialValues
    };
};