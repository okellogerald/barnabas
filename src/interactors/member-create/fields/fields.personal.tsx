import { Gender } from '@/constants';
import { PersonalInfoSchema, PersonalInfo } from '../schemas/schemas.personal';
import { PersonalInfoKeys } from '../types';
import { SchemaFormFieldsMap, SchemaFormBuilder } from '@/components/form/schema_based';

/**
 * Create a SchemaFormBuilder for personal information
 */
const builder = new SchemaFormBuilder(PersonalInfoSchema);

/**
 * Form field definitions for personal information
 */
export const personalFields: SchemaFormFieldsMap<PersonalInfo, PersonalInfoKeys> = {
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

/**
 * Layout for the personal information form
 */
export const personalLayout = {
  rows: {
    row1: ['firstName', 'middleName', 'lastName'] as PersonalInfoKeys[],
    row2: ['gender', 'dateOfBirth', 'placeOfBirth'] as PersonalInfoKeys[],
    row3: ['envelopeNumber', 'profilePhoto'] as PersonalInfoKeys[],
  },
  span: 8, // 3 fields per row (24/3=8)
};