import { EducationLevel } from '@/constants';
import { ProfessionalInfoKeys } from '../types';
import { ProfessionalInfoSchema, ProfessionalInfo } from '../schemas/schemas.professional';
import { SchemaFormBuilder, SchemaFormFieldsMap } from '@/components/form/schema_based';

/**
 * Create a SchemaFormBuilder for professional information
 */
const builder = new SchemaFormBuilder(ProfessionalInfoSchema);

/**
 * Form field definitions for professional information
 */
export const professionalFields: SchemaFormFieldsMap<ProfessionalInfo, ProfessionalInfoKeys> = {
  occupation: builder.createTextField('occupation'),
  placeOfWork: builder.createTextField('placeOfWork'),
  educationLevel: builder.createEnumSelectField('educationLevel', EducationLevel, {
    placeholder: "Select education level"
  }),
  profession: builder.createTextField('profession'),
};

/**
 * Layout for the professional information form
 */
export const professionalLayout = {
  rows: {
    row1: ['occupation', 'placeOfWork'] as ProfessionalInfoKeys[],
    row2: ['educationLevel', 'profession'] as ProfessionalInfoKeys[],
  },
  span: 8, // 3 fields per row (24/3=8)
};