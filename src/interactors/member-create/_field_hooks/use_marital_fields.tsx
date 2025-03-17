import { MaritalStatus, MarriageType } from '@/constants';
import { MaritalInfoKeys } from '../types';
import { MaritalInfoSchema, MaritalInfo } from '../schemas/schemas.marital';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { sampleMember } from '@/_dev/sample_member';
import { useEffect, useState, useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";

/**
 * Hook to create and setup marital form fields with change tracking
 */
export const useMaritalFields = () => {
  const [form] = Form.useForm<MaritalInfo>();
  const [fieldState, setFieldState] = useState<'enabled' | 'disabled'>('enabled');
  const builder = useSchemaFormBuilder(MaritalInfoSchema)

  // Create initial values object
  const initialValues: Partial<MaritalInfo> = {
    maritalStatus: sampleMember.maritalStatus,
    marriageType: sampleMember.marriageType,
    dateOfMarriage: sampleMember.dateOfMarriage,
    spouseName: sampleMember.spouseName || '',
    placeOfMarriage: sampleMember.placeOfMarriage || '',
    spousePhoneNumber: sampleMember.spousePhoneNumber || '',
  };

  // Handle field change event - specifically for marital status changes
  const changeHandler = useCallback((changedFields: FieldData[]) => {
    const statusField = changedFields.find(field =>
      Array.isArray(field.name) && field.name[0] === 'maritalStatus'
    );

    if (statusField) {
      const status = statusField.value as MaritalStatus;

      if (status === MaritalStatus.Single ||
        status === MaritalStatus.Separated ||
        status === MaritalStatus.Divorced) {

        // Reset other fields to empty values
        form.setFields([
          { name: 'marriageType', value: undefined },
          { name: 'dateOfMarriage', value: undefined },
          { name: 'spouseName', value: undefined },
          { name: 'placeOfMarriage', value: undefined },
          { name: 'spousePhoneNumber', value: undefined },
        ]);

        // Disable fields
        setFieldState('disabled');
      } else {
        // Enable fields
        setFieldState('enabled');
      }
    }
  }, [form]);

  // Set up the builder with initial values
  useEffect(() => {
    // Set initial field state based on marital status
    if (initialValues.maritalStatus === MaritalStatus.Single ||
      initialValues.maritalStatus === MaritalStatus.Separated ||
      initialValues.maritalStatus === MaritalStatus.Divorced) {
      setFieldState('disabled');
    } else {
      setFieldState('enabled');
    }
  }, []);

  // Create the form fields
  const createFields = useCallback((): SchemaFormFieldsMap<MaritalInfo, MaritalInfoKeys> => {
    return {
      maritalStatus: builder.createEnumSelectField('maritalStatus', MaritalStatus, {
        placeholder: "Select marital status"
      }),

      marriageType: builder.createEnumSelectField('marriageType', MarriageType, {
        placeholder: "Select marriage type",
        disabled: fieldState === 'disabled'
      }),

      dateOfMarriage: builder.createDateField('dateOfMarriage', {
        disabled: fieldState === 'disabled'
      }),

      spouseName: builder.createTextField('spouseName', {
        disabled: fieldState === 'disabled'
      }),

      placeOfMarriage: builder.createTextField('placeOfMarriage', {
        disabled: fieldState === 'disabled'
      }),

      spousePhoneNumber: builder.createPhoneField('spousePhoneNumber', {
        disabled: fieldState === 'disabled'
      }),
    };
  }, [fieldState]);

  return {
    form,
    builder,
    fields: createFields(),
    layout: {
      rows: {
        row1: ['maritalStatus', 'marriageType'] as MaritalInfoKeys[],
        row2: ['spouseName', 'spousePhoneNumber'] as MaritalInfoKeys[],
        row3: ['dateOfMarriage', 'placeOfMarriage'] as MaritalInfoKeys[],
      },
      span: 8, // 3 fields per row (24/3=8)
    },
    onFieldsChange: changeHandler,
    initialValues
  };
};