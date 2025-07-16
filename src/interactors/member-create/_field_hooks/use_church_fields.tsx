import { MemberRole } from '@/constants';
import { ChurchInfoKeys } from '../types';
import { MemberCreateChurchInfoSchema, MemberCreateChurchInfo } from '../schemas/schemas.church';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useEffect, useState, useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { FellowshipSelect } from '@/components/form';
import { ZodFormUtils } from '@/utilities/zod.utils';

// Define the field properties we want to control
interface FieldProperties {
    disabled?: boolean;
    hidden?: boolean;
    required?: boolean;
}

// Define the state structure for field controls
type FieldControlState = {
    [K in ChurchInfoKeys]?: FieldProperties;
};

/**
 * Hook to create and setup church form fields with dynamic control capabilities
 */
export const useChurchFields = () => {
    const [form] = Form.useForm<MemberCreateChurchInfo>();

    // State to track field properties
    const [fieldControls, setFieldControls] = useState<FieldControlState>({
        fellowshipId: {
            disabled: false,
            hidden: false,
            required: true
        },
        fellowshipAbsenceReason: {
            disabled: true, // Initially disabled if attendsFellowship is true
            hidden: false,
            required: false
        },
    });

    const builder = useSchemaFormBuilder(MemberCreateChurchInfoSchema);

    // Create initial values object
    const initialValues: Partial<MemberCreateChurchInfo> = ZodFormUtils.getDefaultsFromSchema(MemberCreateChurchInfoSchema)

    // Handle field changes - specifically for attendsFellowship changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        const attendsField = changedFields.find(field =>
            Array.isArray(field.name) && field.name[0] === 'attendsFellowship'
        );

        if (attendsField !== undefined) {
            const attends = attendsField.value as boolean;

            // Update field controls
            setFieldControls(prev => ({
                ...prev,
                fellowshipAbsenceReason: {
                    ...prev.fellowshipAbsenceReason,
                    disabled: attends,
                    required: !attends
                }
            }));

            // If switching to attends=true, clear the absence reason
            if (attends) {
                form.setFields([
                    { name: 'fellowshipAbsenceReason', value: undefined }
                ]);
            }
        }
    }, [form]);

    // Set up initial field controls based on initial values
    useEffect(() => {
        setFieldControls(prev => ({
            ...prev,
            fellowshipAbsenceReason: {
                ...prev.fellowshipAbsenceReason,
                disabled: initialValues.attendsFellowship ?? true
            }
        }));
    }, []);

    // Create the form fields - now using fieldControls
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreateChurchInfo, ChurchInfoKeys> => {
        return {
            formerChurch: builder.createTextField('formerChurch', {
                disabled: fieldControls.formerChurch?.disabled,
            }),
            memberRole: builder.createEnumSelectField('memberRole', MemberRole, {
                placeholder: "Select member role",
                disabled: fieldControls.memberRole?.disabled,
            }),
            isBaptized: builder.createSwitchField('isBaptized', {
                disabled: fieldControls.isBaptized?.disabled,
            }),
            isConfirmed: builder.createSwitchField('isConfirmed', {
                disabled: fieldControls.isConfirmed?.disabled,
            }),
            partakesLordSupper: builder.createSwitchField('partakesLordSupper', {
                disabled: fieldControls.partakesLordSupper?.disabled,
            }),
            fellowshipId: builder.createCustomField('fellowshipId',
                () => <FellowshipSelect disabled={fieldControls.fellowshipId?.disabled} />,
                {
                    label: "Fellowship",
                    rules: fieldControls.fellowshipId?.required
                        ? [{ required: true, message: "Please select the fellowship this member belongs to" }]
                        : undefined
                }
            ),
            nearestMemberName: builder.createTextField('nearestMemberName', {
                disabled: fieldControls.nearestMemberName?.disabled,
            }),
            nearestMemberPhone: builder.createPhoneField('nearestMemberPhone', {
                disabled: fieldControls.nearestMemberPhone?.disabled,
            }),
            attendsFellowship: builder.createSwitchField('attendsFellowship', {
                disabled: fieldControls.attendsFellowship?.disabled,
            }),
            fellowshipAbsenceReason: builder.createTextAreaField('fellowshipAbsenceReason', {
                disabled: fieldControls.fellowshipAbsenceReason?.disabled,
                placeholder: "Please provide a reason for not attending fellowship",
            }),
        };
    }, [fieldControls, builder]);

    // Field control methods
    const setFieldProperty = useCallback((
        fieldName: ChurchInfoKeys,
        property: keyof FieldProperties,
        value: boolean
    ) => {
        setFieldControls(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                [property]: value
            }
        }));
    }, []);

    // Convenience methods for common operations
    const setFieldDisabled = useCallback((fieldName: ChurchInfoKeys, disabled: boolean) => {
        setFieldProperty(fieldName, 'disabled', disabled);
    }, [setFieldProperty]);

    const setFieldHidden = useCallback((fieldName: ChurchInfoKeys, hidden: boolean) => {
        setFieldProperty(fieldName, 'hidden', hidden);
    }, [setFieldProperty]);

    const setFieldRequired = useCallback((fieldName: ChurchInfoKeys, required: boolean) => {
        setFieldProperty(fieldName, 'required', required);
    }, [setFieldProperty]);

    // Reset field controls to their default state
    const resetFieldControls = useCallback(() => {
        setFieldControls({
            fellowshipId: {
                disabled: false,
                required: true
            },
            fellowshipAbsenceReason: {
                disabled: initialValues.attendsFellowship ?? true,
                required: !(initialValues.attendsFellowship ?? true)
            },
        });
    }, [initialValues.attendsFellowship]);

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
            span: 12, // 2 fields per row (24/2=12)
        },
        onFieldsChange: changeHandler,
        initialValues,
        // Export control methods
        controls: {
            setFieldProperty,
            setFieldDisabled,
            setFieldHidden,
            setFieldRequired,
            resetFieldControls
        }
    };
};