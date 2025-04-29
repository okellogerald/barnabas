import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { Navigation } from '@/app';
import { AsyncState, mapQueryToAsyncState, UI_STATE_TYPE, SuccessState } from '@/lib/state';
import { User } from '@/models';
import { RoleQueries } from '@/features/role';
import { UserQueries } from '../user.queries';

/**
 * Custom success state for user details
 */
export class UserDetailsSuccessState extends SuccessState<User> {
    constructor(
        user: User,
        public readonly actions: {
            refresh: () => void;
            edit: () => void;
            back: () => void;
            delete: () => Promise<void>;
            confirmDelete: () => void;
            hideDeleteConfirm: () => void;
        },
        public readonly isDeleting: boolean,
        public readonly deleteModalVisible: boolean
    ) {
        super(user, { refresh: actions.refresh });
    }

    static is(state: AsyncState<any>): state is UserDetailsSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            'actions' in state &&
            'isDeleting' in state &&
            'deleteModalVisible' in state
        );
    }
}

/**
 * Hook for managing user details page
 * Handles data fetching, state management, and actions
 */
export const useUserDetails = () => {
    // Get user ID from URL params
    const { userId = '' } = useParams<{ userId: string }>();

    // State for delete modal and loading
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch user data
    const userQuery = UserQueries.useDetail(userId);

    // Fetch user's role to get permissions
    const roleQuery = userQuery.data ? RoleQueries.useDetail(userQuery.data.roleId) : { data: null, isLoading: false };

    // Delete mutation
    const deleteMutation = UserQueries.useDelete();

    // Handle back navigation
    const handleBack = useCallback(() => {
        Navigation.Users.toList();
    }, []);

    // Handle edit navigation
    const handleEdit = useCallback(() => {
        Navigation.Users.toEdit(userId);
    }, [userId]);

    // Show delete confirmation modal
    const handleConfirmDelete = useCallback(() => {
        setDeleteModalVisible(true);
    }, []);

    // Hide delete confirmation modal
    const handleHideDeleteConfirm = useCallback(() => {
        setDeleteModalVisible(false);
    }, []);

    // Handle user deletion
    const handleDelete = useCallback(async () => {
        try {
            setIsDeleting(true);
            await deleteMutation.mutateAsync(userId);
            message.success('User deleted successfully');
            Navigation.Users.toList();
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to delete user');
        } finally {
            setIsDeleting(false);
            setDeleteModalVisible(false);
        }
    }, [userId, deleteMutation]);

    // Create the actions object for the success state
    const actions = {
        refresh: () => { userQuery.refetch() },
        edit: handleEdit,
        back: handleBack,
        delete: handleDelete,
        confirmDelete: handleConfirmDelete,
        hideDeleteConfirm: handleHideDeleteConfirm,
    };

    // Map the query to our AsyncState pattern
    const userState = mapQueryToAsyncState(userQuery, {
        loadingMessage: 'Loading user details...',
        onSuccess: (data) => new UserDetailsSuccessState(
            data,
            actions,
            isDeleting,
            deleteModalVisible
        )
    });

    return {
        userState,
        roleState: roleQuery,
        isDeleting,
        deleteModalVisible,
        actions
    };
};