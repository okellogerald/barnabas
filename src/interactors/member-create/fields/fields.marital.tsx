import { MaritalStatus, MarriageType } from '@/constants';
import { MaritalInfoKeys } from '../types';
import { MaritalInfoSchema, MaritalInfo } from '../schemas/schemas.marital';
import { SchemaFormBuilder, SchemaFormFieldsMap } from '@/components/form/schema_based';

/**
 * Create a SchemaFormBuilder for marital information
 */
const builder = new SchemaFormBuilder(MaritalInfoSchema);

/**
 * Form field definitions for marital information
 */
export const maritalFields: SchemaFormFieldsMap<MaritalInfo, MaritalInfoKeys> = {
    maritalStatus: builder.createEnumSelectField('maritalStatus', MaritalStatus, {
        placeholder: "Select marital status"
    }),
    marriageType: builder.createEnumSelectField('marriageType', MarriageType, {
        placeholder: "Select marriage type",
    }),
    dateOfMarriage: builder.createDateField('dateOfMarriage'),
    spouseName: builder.createTextField('spouseName'),
    placeOfMarriage: builder.createTextField('placeOfMarriage'),
    spousePhoneNumber: builder.createPhoneField('spousePhoneNumber'),
};

/**
 * Form field definitions for marital information
 */
export const marriedMaritalFields: SchemaFormFieldsMap<MaritalInfo, MaritalInfoKeys> = {
    maritalStatus: builder.createEnumSelectField('maritalStatus', MaritalStatus, {
        placeholder: "Select marital status",
    }),
    marriageType: builder.createEnumSelectField('marriageType', MarriageType, {
        placeholder: "Select marriage type",
        disabled: true,
    }),
    dateOfMarriage: builder.createDateField('dateOfMarriage', {
        disabled: true,
    }),
    spouseName: builder.createTextField('spouseName', {
        disabled: true,
    }),
    placeOfMarriage: builder.createTextField('placeOfMarriage', {
        disabled: true,
    }),
    spousePhoneNumber: builder.createPhoneField('spousePhoneNumber', {
        disabled: true,
    }),
};

/**
 * Layout for the marital information form
 */
export const maritalLayout = {
    rows: {
        row1: ['maritalStatus', 'marriageType'] as MaritalInfoKeys[],
        row2: ['spouseName', 'spousePhoneNumber'] as MaritalInfoKeys[],
        row3: ['dateOfMarriage', 'placeOfMarriage'] as MaritalInfoKeys[],
    },
    span: 8, // 3 fields per row (24/3=8)
};