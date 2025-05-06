import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useParams } from 'react-router-dom';
import { FellowshipQueries } from '@/features/fellowship/fellowship.queries';
import { UpdateFellowshipDTO } from '@/data/fellowship';
import { Navigation } from '@/app';
import { mapQueryToAsyncState } from '@/lib/state';
import { MemberQueries } from '@/features/member';

export interface FellowshipEditFormValues {
    name: string;
    notes?: string;
    chairmanId?: string;
    deputyChairmanId?: string;
    secretaryId?: string;
    treasurerId?: string;
}

/**
 * Hook for managing fellowship editing
 * 
 * Provides form handling, data fetching, submission, and navigation for editing a fellowship
 */
export const useFellowshipEdit = () => {
    // Get fellowship ID from URL
    const { id } = useParams<{ id: string }>();

    // Form instance
    const [form] = Form.useForm<FellowshipEditFormValues>();

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch fellowship data
    const fellowshipQuery = FellowshipQueries.useDetail(id || '');

    // Fetch members for leadership selection
    const fellowshipMembersQuery = id ? MemberQueries.useList({ fellowshipId: id }) : { data: null, isLoading: false };

    // Use mutation hook for updating fellowship
    const updateMutation = FellowshipQueries.useUpdate();

    // Initialize form when data is loaded
    useEffect(() => {
        if (fellowshipQuery.data) {
            const fellowship = fellowshipQuery.data;

            // Set form values
            form.setFieldsValue({
                name: fellowship.name,
                notes: fellowship.notes || undefined,
                chairmanId: fellowship.chairmanId || undefined,
                deputyChairmanId: fellowship.deputyChairmanId || undefined,
                secretaryId: fellowship.secretaryId || undefined,
                treasurerId: fellowship.treasurerId || undefined,
            });
        }
    }, [fellowshipQuery.data, form]);

    // Handle form submission
    const handleSubmit = async (values: FellowshipEditFormValues) => {
        if (!id) return;

        try {
            setIsSubmitting(true);

            // Prepare data for API
            const updateDto: UpdateFellowshipDTO = {
                name: values.name.trim(),
                notes: values.notes?.trim() || null,
                chairmanId: values.chairmanId || null,
                deputyChairmanId: values.deputyChairmanId || null,
                secretaryId: values.secretaryId || null,
                treasurerId: values.treasurerId || null,
            };

            // Call API to update fellowship
            await updateMutation.mutateAsync({ id, data: updateDto });

            // Show success message
            message.success('Fellowship updated successfully');

            // Navigate back to fellowship details
            Navigation.Fellowships.toDetails(id);
        } catch (error) {
            console.error('Error updating fellowship:', error);
            message.error('Failed to update fellowship. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form cancellation
    const handleCancel = () => {
        id ? Navigation.Fellowships.toDetails(id) : Navigation.Fellowships.toList();
    };

    // Reset form to initial values from data
    const handleReset = () => {
        if (fellowshipQuery.data) {
            const fellowship = fellowshipQuery.data;

            form.setFieldsValue({
                name: fellowship.name,
                notes: fellowship.notes || undefined,
                chairmanId: fellowship.chairmanId || undefined,
                deputyChairmanId: fellowship.deputyChairmanId || undefined,
                secretaryId: fellowship.secretaryId || undefined,
                treasurerId: fellowship.treasurerId || undefined,
            });
        }
    };

    // Map fellowship query to async state for consistent UI handling
    const fellowshipState = mapQueryToAsyncState(fellowshipQuery, {
        loadingMessage: 'Loading fellowship details...',
        resourceType: 'Fellowship',
        resourceId: id,
    });

    // Map members query to members list
    const members = fellowshipMembersQuery.data?.results || [];
    const membersLoading = fellowshipMembersQuery.isLoading;

    return {
        form,
        isSubmitting,
        fellowshipState,
        members,
        membersLoading,
        handleSubmit,
        handleCancel,
        handleReset,
    };
};