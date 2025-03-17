import { InterestInfo } from '../schemas/schemas.interests';
import { useEffect, useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { useInterestsStore } from "../stores/store.interests";
import { useStore } from "zustand";

/**
 * Hook to manage interest fields and interact with the interests store
 */
export const useInterestFields = () => {
    const [form] = Form.useForm<InterestInfo>();
    const interestsStore = useStore(useInterestsStore);

    // Handle field changes
    const changeHandler = useCallback((_: FieldData[]) => {
        // No conditional behavior for interest fields
    }, [form]);

    // Initialize the form
    useEffect(() => {
        // Initialize with empty values
        form.resetFields();
    }, []);

    return {
        form,
        interests: {
            items: interestsStore.interests,
            set: interestsStore.setInterests
        },
        onFieldsChange: changeHandler
    };
};