import { useState } from 'react';
import { Form, message } from 'antd';
import { CreateFellowshipDTO } from '@/data/fellowship';
import { FellowshipQueries } from '@/features/fellowship/fellowship.queries';
import { Navigation } from '@/app';

export interface FellowshipFormValues {
    name: string;
    notes?: string;
}

/**
 * Hook for managing fellowship creation
 * 
 * Provides form handling, submission, and navigation for creating a new fellowship
 */
export const useFellowshipCreate = () => {
    // Form instance
    const [form] = Form.useForm<FellowshipFormValues>();

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use mutation hook for creating fellowship
    const createMutation = FellowshipQueries.useCreate();

    // Handle form submission
    const handleSubmit = async (values: FellowshipFormValues) => {
        try {
            setIsSubmitting(true);

            // Prepare data for API
            const createDto: CreateFellowshipDTO = {
                name: values.name.trim(),
                notes: values.notes?.trim() || null,
            };

            // Call API to create fellowship
            await createMutation.mutateAsync(createDto);

            // Show success message
            message.success('Fellowship created successfully');

            // Navigate to fellowship list
            Navigation.Fellowships.toList();
        } catch (error) {
            console.error('Error creating fellowship:', error);
            message.error('Failed to create fellowship. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form cancellation
    const handleCancel = () => {
        Navigation.Fellowships.toList();
    };

    // Reset form to initial values
    const handleReset = () => {
        form.resetFields();
    };

    return {
        form,
        isSubmitting,
        handleSubmit,
        handleCancel,
        handleReset,
    };
};