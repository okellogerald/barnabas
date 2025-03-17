import { MemberRole } from '@/constants';
import { ChurchInfoKeys } from '../types';
import { ChurchInfoSchema, ChurchInfo } from '../schemas/schemas.church';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { sampleMember } from '@/_dev/sample_member';
import { useEffect, useState, useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { FellowshipSelect } from '@/components/form';

/**
 * Hook to create and setup church form fields
 */
export const useChurchFields = () => {
    const [form] = Form.useForm<ChurchInfo>();
    const [fieldState, setFieldState] = useState<{
        fellowshipAbsenceReason: 'enabled' | 'disabled'
    }>({
        fellowshipAbsenceReason: 'enabled'
    });

    const builder = useSchemaFormBuilder(ChurchInfoSchema)

    // Create initial values object
    const initialValues: Partial<ChurchInfo> = {
        formerChurch: sampleMember.formerChurch,
        memberRole: sampleMember.memberRole || MemberRole.Regular,
        isBaptized: sampleMember.isBaptized ?? false,
        isConfirmed: sampleMember.isConfirmed ?? false,
        partakesLordSupper: sampleMember.partakesLordSupper ?? false,
        fellowshipId: sampleMember.fellowshipId,
        nearestMemberName: sampleMember.nearestMemberName,
        nearestMemberPhone: sampleMember.nearestMemberPhone,
        attendsFellowship: sampleMember.attendsFellowship ?? false,
        fellowshipAbsenceReason: sampleMember.fellowshipAbsenceReason,
    };

    // Handle field changes - specifically for attendsFellowship changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        const attendsField = changedFields.find(field =>
            Array.isArray(field.name) && field.name[0] === 'attendsFellowship'
        );

        if (attendsField !== undefined) {
            const attends = attendsField.value as boolean;

            // If member attends fellowship, disable absence reason field
            // If member doesn't attend, enable absence reason field
            setFieldState({
                fellowshipAbsenceReason: attends ? 'disabled' : 'enabled'
            });

            // If switching to attends=true, clear the absence reason
            if (attends) {
                form.setFields([
                    { name: 'fellowshipAbsenceReason', value: undefined }
                ]);
            }
        }
    }, [form]);

    // Set up the builder with initial values
    useEffect(() => {
        // Set initial field state based on attendsFellowship
        setFieldState({
            fellowshipAbsenceReason: initialValues.attendsFellowship ? 'disabled' : 'enabled'
        });
    }, []);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<ChurchInfo, ChurchInfoKeys> => {
        return {
            formerChurch: builder.createTextField('formerChurch'),
            memberRole: builder.createEnumSelectField('memberRole', MemberRole, {
                placeholder: "Select member role"
            }),
            isBaptized: builder.createSwitchField('isBaptized'),
            isConfirmed: builder.createSwitchField('isConfirmed'),
            partakesLordSupper: builder.createSwitchField('partakesLordSupper'),
            fellowshipId: builder.createCustomField('fellowshipId',
                () => <FellowshipSelect />,
                {
                    label: "Fellowship",
                    rules: [{ required: true, message: "Please select the fellowship this member belongs to" }]
                }
            ),
            nearestMemberName: builder.createTextField('nearestMemberName'),
            nearestMemberPhone: builder.createPhoneField('nearestMemberPhone'),
            attendsFellowship: builder.createSwitchField('attendsFellowship'),
            fellowshipAbsenceReason: builder.createTextAreaField('fellowshipAbsenceReason', {
                disabled: fieldState.fellowshipAbsenceReason === 'disabled',
                placeholder: "Please provide a reason for not attending fellowship"
            }),
        };
    }, [fieldState]);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['fellowshipId', 'memberRole'] as ChurchInfoKeys[],
                row2: ['attendsFellowship', 'fellowshipAbsenceReason'] as ChurchInfoKeys[],
                row3: ['nearestMemberName', 'nearestMemberPhone'] as ChurchInfoKeys[],
                row4: ['isBaptized', 'isConfirmed'] as ChurchInfoKeys[],
                row5: ['partakesLordSupper'] as ChurchInfoKeys[],
                row6: ['formerChurch'] as ChurchInfoKeys[],
            },
            span: 8, // 3 fields per row (24/3=8)
        },
        onFieldsChange: changeHandler,
        initialValues
    };
};