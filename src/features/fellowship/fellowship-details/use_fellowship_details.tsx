import { useState } from 'react';
import { message, Modal } from 'antd';
import { useParams } from 'react-router-dom';
import { FellowshipQueries } from '@/features/fellowship/queries';
import { mapQueryToAsyncState } from '@/lib/state';
import { Navigation } from '@/app';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * Hook for managing fellowship details view
 * 
 * Provides data fetching, actions, and navigation for viewing and managing a fellowship
 */
export const useFellowshipDetails = () => {
    // Get fellowship ID from URL
    const { id } = useParams<{ id: string }>();

    // UI states
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch fellowship data
    const fellowshipQuery = FellowshipQueries.useDetail(id || '');

    // Fetch members count
    const membersCountQuery = id ? FellowshipQueries.useMembersCount(id) : { data: null, isLoading: false };

    // Use mutation hook for deleting fellowship
    const deleteMutation = FellowshipQueries.useDelete();

    // Actions
    const actions = {
        // Navigate to edit page
        edit: () => {
            Navigation.Fellowships.toEdit(id || "");
        },

        // Navigate to list page
        back: () => {
            Navigation.Fellowships.toList();
        },

        // Navigate to create member page
        addMember: () => {
            Navigation.Members.toCreate({ fellowshipId: id || '' })
        },

        // Navigate to members list filtered by this fellowship
        viewMembers: () => {
            Navigation.Members.toList({ fellowshipId: id });
        },

        // Show delete confirmation modal
        showDeleteConfirm: () => {
            setDeleteModalVisible(true);
        },

        // Hide delete confirmation modal
        hideDeleteConfirm: () => {
            setDeleteModalVisible(false);
        },

        // Delete fellowship
        delete: async () => {
            if (!id) return;

            try {
                setIsDeleting(true);
                await deleteMutation.mutateAsync(id);

                message.success('Fellowship deleted successfully');
                Navigation.Fellowships.toList();
            } catch (error) {
                console.error('Error deleting fellowship:', error);
                message.error('Failed to delete fellowship. Please try again.');
            } finally {
                setIsDeleting(false);
                setDeleteModalVisible(false);
            }
        },

        // Show delete confirmation dialog using Ant Design Modal
        confirmDelete: () => {
            Modal.confirm({
                title: 'Delete Fellowship',
                icon: <ExclamationCircleOutlined />,
                content: 'Are you sure you want to delete this fellowship? This action cannot be undone.',
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: actions.delete,
            });
        },

        // Refresh data
        refresh: () => {
            fellowshipQuery.refetch();
            if (id) {
                if ("refetch" in membersCountQuery) {
                    membersCountQuery.refetch?.();
                }
            }
        },
    };

    // Map fellowship query to async state for consistent UI handling
    const fellowshipState = mapQueryToAsyncState(fellowshipQuery, {
        loadingMessage: 'Loading fellowship details...',
        resourceType: 'Fellowship',
        resourceId: id,
    });

    // Get members count
    const membersCount = membersCountQuery.data?.total || 0;
    const membersCountLoading = membersCountQuery.isLoading;

    return {
        fellowshipState,
        membersCount,
        membersCountLoading,
        isDeleting,
        deleteModalVisible,
        actions,
    };
};