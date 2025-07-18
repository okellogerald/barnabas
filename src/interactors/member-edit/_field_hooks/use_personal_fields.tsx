import { Gender } from '@/constants';
import { PersonalInfoKeys } from '../types';
import { MemberEditPersonalInfoSchema, MemberEditPersonalInfo } from '../schemas/schemas.personal';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback, useRef } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { Member } from '@/models';
import { ProfileImageUpload, ProfileImageUploadRef } from '@/components/form/shared';

/**
 * Hook to create and setup personal form fields for member editing
 * 
 * @param memberData Optional member data to initialize the form with
 */
export const usePersonalFields = (memberData?: Member) => {
    // Extract initial values from member data if available
    const initialValues: Partial<MemberEditPersonalInfo> = memberData ? {
        firstName: memberData.firstName,
        middleName: memberData.middleName,
        lastName: memberData.lastName,
        gender: memberData.gender,
        dateOfBirth: memberData.dateOfBirth,
        placeOfBirth: memberData.placeOfBirth,
        profilePhoto: memberData.profilePhoto
    } : {};

    // Initialize form with initial values
    const [form] = Form.useForm<MemberEditPersonalInfo>();
    const builder = useSchemaFormBuilder(MemberEditPersonalInfoSchema);
    const profileImageRef = useRef<ProfileImageUploadRef>(null);

    // Handle field changes
    const changeHandler = useCallback((changedFields: FieldData[]) => {
        console.log("Personal fields changed:", changedFields);
    }, [form]);

    // Check if there are pending image uploads
    const hasPendingImageUploads = useCallback((): boolean => {
        return profileImageRef.current?.hasPendingChanges() || false;
    }, []);

    // Get pending image message
    const getPendingImageMessage = useCallback((): string => {
        if (profileImageRef.current?.hasPendingChanges()) {
            return profileImageRef.current.getPendingMessage();
        }
        return '';
    }, []);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberEditPersonalInfo, PersonalInfoKeys> => {
        return {
            firstName: builder.createTextField('firstName'),
            middleName: builder.createTextField('middleName'),
            lastName: builder.createTextField('lastName'),
            gender: builder.createEnumSelectField('gender', Gender, {
                placeholder: "Select gender"
            }),
            dateOfBirth: builder.createDateField('dateOfBirth'),
            placeOfBirth: builder.createTextField('placeOfBirth'),
            profilePhoto: builder.createCustomField('profilePhoto', () => (
                <ProfileImageUpload
                    ref={profileImageRef}
                    placeholder="Upload Profile Photo"
                    size="large"
                    autoUpload={false} // Enable manual save mode for better UX in edit form
                />
            )),
        };
    }, []);

    return {
        form,
        builder,
        fields: createFields(),
        layout: {
            rows: {
                row1: ['firstName', 'middleName', 'lastName'] as PersonalInfoKeys[],
                row2: ['gender', 'dateOfBirth', 'placeOfBirth'] as PersonalInfoKeys[],
                row3: ['profilePhoto'] as PersonalInfoKeys[],
            },
            span: 8, // 3 fields per row (24/3=8)
        },
        onFieldsChange: changeHandler,
        initialValues,
        // Additional methods for checking pending uploads
        hasPendingImageUploads,
        getPendingImageMessage,
    };
};