import { MemberRole } from '@/constants';
import { ChurchInfoKeys } from '../types';
import { ChurchInfoSchema, ChurchInfo } from '../schemas/schemas.church';
import { SchemaFormBuilder, SchemaFormFieldsMap } from '@/components/form/schema_based';
import { FellowshipSelect } from '@/components/form';

/**
 * Create a SchemaFormBuilder for church information
 */
const builder = new SchemaFormBuilder(ChurchInfoSchema);

/**
 * Form field definitions for church information
 */
export const churchFields: SchemaFormFieldsMap<ChurchInfo, ChurchInfoKeys> = {
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
            rules: [{ required: true, message: "Please select the fellowship this member belong to" }]
        }
    ),
    nearestMemberName: builder.createTextField('nearestMemberName'),
    nearestMemberPhone: builder.createPhoneField('nearestMemberPhone'),
    attendsFellowship: builder.createSwitchField('attendsFellowship'),
    fellowshipAbsenceReason: builder.createTextAreaField('fellowshipAbsenceReason'),
};

/**
 * Layout for the church information form
 */
export const churchLayout = {
    rows: {
        row1: ['fellowshipId', 'memberRole'] as ChurchInfoKeys[],
        row2: ['attendsFellowship', 'fellowshipAbsenceReason'] as ChurchInfoKeys[],
        row3: ['nearestMemberName', 'nearestMemberPhone'] as ChurchInfoKeys[],
        row4: ['isBaptized', 'isConfirmed'] as ChurchInfoKeys[],
        row5: ['partakesLordSupper'] as ChurchInfoKeys[],
        row6: ['formerChurch'] as ChurchInfoKeys[],
    },
    span: 8, // 3 fields per row (24/3=8)
};