import { MemberEditInterestsInfo, MemberEditInterestsInfoSchema } from '../schemas/schemas.interests';
import { useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { VolunteerOpportunitySelect } from '@/components/form';
import { InterestsInfoKeys } from '../types';
import { Member } from '@/models';

/**
 * Hook to manage interest fields and interact with the interests store
 */
export const useInterestFields = (member?: Member) => {
    const [form] = Form.useForm<MemberEditInterestsInfo>();
    const builder = useSchemaFormBuilder(MemberEditInterestsInfoSchema)

    // Create initial values object
    const initialValues: Partial<MemberEditInterestsInfo> = {
        interests: member?.interests.map(i => i.id),
    };

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        // Personal fields don't have conditional behaviors,
        // but we could implement them here if needed
        console.log("Personal fields changed:", changedFields);
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberEditInterestsInfo, "interests"> => {
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