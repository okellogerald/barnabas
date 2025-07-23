import { Gender } from '@/constants';
import { PersonalInfoKeys } from '../types';
import { MemberCreatePersonalInfoSchema, MemberCreatePersonalInfo } from '../schemas/schemas.personal';
import { SchemaFormFieldsMap, useSchemaFormBuilder } from '@/components/form/schema_based';
import { useCallback, useRef } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { ZodFormUtils } from '@/utilities';
import { ProfileImageUpload, ProfileImageUploadRef } from '@/components/form';

/**
 * Hook to create and setup personal form fields
 */
export const usePersonalFields = () => {
    const [form] = Form.useForm<MemberCreatePersonalInfo>();
    const builder = useSchemaFormBuilder(MemberCreatePersonalInfoSchema);
    const initialValues = ZodFormUtils.getDefaultsFromSchema(MemberCreatePersonalInfoSchema);
    const profileImageRef = useRef<ProfileImageUploadRef>(null);

    // Handle field changes
    const changeHandler = useCallback((_: FieldData[]) => {
        // Personal fields don't have conditional behaviors,
        // but we could implement them here if needed
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

    // Upload pending image and return filename
    const uploadPendingImage = useCallback(async (): Promise<string | undefined> => {
        if (!profileImageRef.current?.hasPendingChanges()) {
            return; // No pending upload
        }

        try {
            const filename = await profileImageRef.current.uploadPendingImage();
            if (filename) {
                // Update the form field with the new filename
                form.setFieldValue('profilePhoto', filename);
            }
            return filename;
        } catch (error) {
            console.error('Failed to upload profile image:', error);
            throw error;
        }
    }, [form]);

    // Create the form fields
    const createFields = useCallback((): SchemaFormFieldsMap<MemberCreatePersonalInfo, PersonalInfoKeys> => {
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
                    size="large"
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
        // Additional methods for handling pending uploads
        hasPendingImageUploads,
        getPendingImageMessage,
        uploadPendingImage,
    };
};