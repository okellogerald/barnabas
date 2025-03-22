import { MemberCreateInterestsInfo, MemberCreateInterestsInfoSchema } from '../schemas/schemas.interests';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { VolunteerOpportunitySelect } from '@/components/form';
import { InterestsInfoKeys } from '../types';

/**
 * Hook to manage interest fields and interact with the interests store
 */
export const useInterestFields = () => {
    const [form] = Form.useForm<MemberCreateInterestsInfo>();
    const builder = useSchemaFormBuilder(MemberCreateInterestsInfoSchema)

    // Create initial values object
    const initialValues: Partial<MemberCreateInterestsInfo> = {
        // interests: sampleMember.interests,
    };

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Personal fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Personal fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreateInterestsInfo, "interests"> => {
        return {
            interests: builder.createCustomField(
                "interests",
                () => <VolunteerOpportunitySelect />
            )
        };
    }, []);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['interests'] as InterestsInfoKeys[],
            },
            span: 24, // 1 fields per row (24/1=24)
        },
        onFieldsChange: changeHandler,
        initialValues
    };
};