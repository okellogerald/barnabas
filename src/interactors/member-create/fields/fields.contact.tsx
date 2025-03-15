import { ContactInfoKeys } from '../types';
import { ContactInfoSchema, ContactInfo } from '../schemas/schemas.contact';
import { SchemaFormBuilder, SchemaFormFieldsMap } from '@/components/form/schema_based';

/**
 * Create a SchemaFormBuilder for contact information
 */
const builder = new SchemaFormBuilder(ContactInfoSchema);

/**
 * Form field definitions for contact information
 */
export const contactFields: SchemaFormFieldsMap<ContactInfo, ContactInfoKeys> = {
  phoneNumber: builder.createPhoneField('phoneNumber'),
  email: builder.createEmailField('email'),
  residenceNumber: builder.createTextField('residenceNumber'),
  residenceBlock: builder.createTextField('residenceBlock'),
  postalBox: builder.createTextField('postalBox'),
  residenceArea: builder.createTextField('residenceArea'),
};

/**
 * Layout for the contact information form
 */
export const contactLayout = {
  rows: {
    row1: ['phoneNumber', 'email'] as ContactInfoKeys[],
    row3: ['residenceNumber', 'residenceBlock'] as ContactInfoKeys[],
    row4: ['postalBox', 'residenceArea'] as ContactInfoKeys[],
  },
  span: 8, // 3 fields per row (24/3=8)
};