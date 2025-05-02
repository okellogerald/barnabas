// // import { useState, useCallback } from 'react';
// // import { useParams } from 'react-router-dom';
// // import { message } from 'antd';
// // import { Navigation } from '@/app';
// // import { AsyncState, mapQueryToAsyncState, UI_STATE_TYPE, SuccessState } from '@/lib/state';
// // import { User } from '@/models';
// // import { UserQueries } from '../user.queries';
// // import { AuthManager } from '@/managers/auth';
// // import { Actions } from '@/managers/auth/permission';

// // interface UserDetailsSuccessStateArgs {
// //     user: User;
// //     actions: {
// //         refresh: () => void;
// //         edit: () => void;
// //         back: () => void;
// //         delete: () => Promise<void>;
// //         confirmDelete: () => void;
// //         hideDeleteConfirm: () => void;
// //     };
// //     isDeleting: boolean;
// //     deleteModalVisible: boolean;
// //     canDeleteUser?: boolean;
// //     canEditUser?: boolean;
// // }

// // /**
// //  * Custom success state for user details
// //  */
// // export class UserDetailsSuccessState extends SuccessState<User> {
// //     constructor(args: UserDetailsSuccessStateArgs) {
// //         super(args.user, { refresh: args.actions.refresh });
// //         this.actions = args.actions;
// //         this.isDeleting = args.isDeleting;
// //         this.deleteModalVisible = args.deleteModalVisible;
// //         this.canDeleteUser = args.canDeleteUser ?? true;
// //         this.canEditUser = args.canEditUser ?? true;
// //     }

// //     public readonly actions: UserDetailsSuccessStateArgs['actions'];
// //     public readonly isDeleting: boolean;
// //     public readonly deleteModalVisible: boolean;
// //     public readonly canDeleteUser: boolean;
// //     public readonly canEditUser: boolean;

// //     static is(state: AsyncState<any>): state is UserDetailsSuccessState {
// //         if (state.type !== UI_STATE_TYPE.SUCCESS) return false;

// //         const typedState = state as unknown as Record<string, unknown>;

// //         // Check required properties existence and types
// //         if (!('actions' in typedState) || typeof typedState.actions !== 'object' || !typedState.actions) return false;
// //         if (!('isDeleting' in typedState) || typeof typedState.isDeleting !== 'boolean') return false;
// //         if (!('deleteModalVisible' in typedState) || typeof typedState.deleteModalVisible !== 'boolean') return false;
// //         if (!('canDeleteUser' in typedState) || typeof typedState.canDeleteUser !== 'boolean') return false;
// //         if (!('canEditUser' in typedState) || typeof typedState.canEditUser !== 'boolean') return false;

// //         // Check actions object structure
// //         const actions = typedState.actions as Record<string, unknown>;
// //         const requiredActions = ['refresh', 'edit', 'back', 'delete', 'confirmDelete', 'hideDeleteConfirm'];
// //         return requiredActions.every(action => action in actions && typeof actions[action] === 'function');
// //     }
// // }

// // /**
// //  * Hook for managing user details page
// //  * Handles data fetching, state management, and actions
// //  */
// // export const useUserDetails = () => {
// //     // Get user ID from URL params
// //     const { id: userId = '' } = useParams<{ id: string }>();

// //     // State for delete modal and loading
// //     const [deleteModalVisible, setDeleteModalVisible] = useState(false);
// //     const [isDeleting, setIsDeleting] = useState(false);

// //     // Fetch user data
// //     const userQuery = UserQueries.useDetail(userId);

// //     // Delete mutation
// //     const deleteMutation = UserQueries.useDelete();

// //     // Handle back navigation
// //     const handleBack = useCallback(() => {
// //         Navigation.Users.toList();
// //     }, []);

// //     // Handle edit navigation
// //     const handleEdit = useCallback(() => {
// //         Navigation.Users.toEdit(userId);
// //     }, [userId]);

// //     // Show delete confirmation modal
// //     const handleConfirmDelete = useCallback(() => {
// //         setDeleteModalVisible(true);
// //     }, []);

// //     // Hide delete confirmation modal
// //     const handleHideDeleteConfirm = useCallback(() => {
// //         setDeleteModalVisible(false);
// //     }, []);

// //     // Handle user deletion
// //     const handleDelete = useCallback(async () => {
// //         try {
// //             setIsDeleting(true);
// //             await deleteMutation.mutateAsync(userId);
// //             message.success('User deleted successfully');
// //             Navigation.Users.toList();
// //         } catch (error) {
// //             console.error('Error deleting user:', error);
// //             message.error('Failed to delete user');
// //         } finally {
// //             setIsDeleting(false);
// //             setDeleteModalVisible(false);
// //         }
// //     }, [userId, deleteMutation]);

// //     // Create the actions object for the success state
// //     const actions = {
// //         refresh: () => { userQuery.refetch() },
// //         edit: handleEdit,
// //         back: handleBack,
// //         delete: handleDelete,
// //         confirmDelete: handleConfirmDelete,
// //         hideDeleteConfirm: handleHideDeleteConfirm,
// //     };

// //     // Check permissions
// //     const canEditUser = AuthManager.instance.hasPermission(Actions.USER_UPDATE);
// //     const canDeleteUser = AuthManager.instance.hasPermission(Actions.USER_DELETE);

// //     // Map the query to our AsyncState pattern
// //     const userState = mapQueryToAsyncState(userQuery, {
// //         loadingMessage: 'Loading user details...',
// //         onSuccess: (data) => new UserDetailsSuccessState({
// //             user: data,
// //             actions,
// //             isDeleting,
// //             deleteModalVisible,
// //             canDeleteUser,
// //             canEditUser,
// //         })
// //     });

// //     return {
// //         userState,
// //         roleState: "",
// //         isDeleting,
// //         deleteModalVisible,
// //         actions
// //     };
// // };
// import { useState, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { message } from 'antd';
// import { Navigation } from '@/app';
// import { AsyncState, mapQueryToAsyncState, UI_STATE_TYPE, SuccessState } from '@/lib/state';
// import { User } from '@/models';
// import { AuthManager } from '@/managers/auth';
// import { Actions } from '@/managers/auth/permission';
// import { UserQueries } from '../user.queries';
// import { RoleQueries } from '@/features/role';

// interface UserDetailsSuccessStateArgs {
//     user: User;
//     actions: {
//         refresh: () => void;
//         edit: () => void;
//         back: () => void;
//         delete: () => Promise<void>;
//         confirmDelete: () => void;
//         hideDeleteConfirm: () => void;
//     };
//     isDeleting: boolean;
//     deleteModalVisible: boolean;
//     canDeleteUser?: boolean;
//     canEditUser?: boolean;
// }

// /**
//  * Custom success state for user details
//  */
// export class UserDetailsSuccessState extends SuccessState<User> {
//     constructor(args: UserDetailsSuccessStateArgs) {
//         super(args.user, { refresh: args.actions.refresh });
//         this.actions = args.actions;
//         this.isDeleting = args.isDeleting;
//         this.deleteModalVisible = args.deleteModalVisible;
//         this.canDeleteUser = args.canDeleteUser ?? true;
//         this.canEditUser = args.canEditUser ?? true;
//     }

//     public readonly actions: UserDetailsSuccessStateArgs['actions'];
//     public readonly isDeleting: boolean;
//     public readonly deleteModalVisible: boolean;
//     public readonly canDeleteUser: boolean;
//     public readonly canEditUser: boolean;

//     static is(state: AsyncState<any>): state is UserDetailsSuccessState {
//         if (state.type !== UI_STATE_TYPE.SUCCESS) return false;

//         const typedState = state as unknown as Record<string, unknown>;

//         // Check required properties existence and types
//         if (!('actions' in typedState) || typeof typedState.actions !== 'object' || !typedState.actions) return false;
//         if (!('isDeleting' in typedState) || typeof typedState.isDeleting !== 'boolean') return false;
//         if (!('deleteModalVisible' in typedState) || typeof typedState.deleteModalVisible !== 'boolean') return false;
//         if (!('canDeleteUser' in typedState) || typeof typedState.canDeleteUser !== 'boolean') return false;
//         if (!('canEditUser' in typedState) || typeof typedState.canEditUser !== 'boolean') return false;

//         // Check actions object structure
//         const actions = typedState.actions as Record<string, unknown>;
//         const requiredActions = ['refresh', 'edit', 'back', 'delete', 'confirmDelete', 'hideDeleteConfirm'];
//         return requiredActions.every(action => action in actions && typeof actions[action] === 'function');
//     }
// }

// /**
//  * Hook for managing user details page
//  * Handles data fetching, state management, and actions
//  */
// export const useUserDetails = () => {
//     // Get user ID from URL params
//     const { id: userId = '' } = useParams<{ id: string }>();

//     // State for delete modal and loading
//     const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);

//     // Fetch user data
//     const userQuery = UserQueries.useDetail(userId);

//     // If user data is available, fetch role details
//     const roleId = userQuery.data?.roleId;
//     const roleQuery = roleId ? RoleQueries.useDetail(roleId) : undefined;

//     // Fetch role actions if role is available
//     const roleActionsQuery = roleId ? RoleQueries.useActions(roleId) : undefined;

//     // Delete mutation
//     const deleteMutation = UserQueries.useDelete();

//     // Handle back navigation
//     const handleBack = useCallback(() => {
//         Navigation.Users.toList();
//     }, []);

//     // Handle edit navigation
//     const handleEdit = useCallback(() => {
//         Navigation.Users.toEdit(userId);
//     }, [userId]);

//     // Show delete confirmation modal
//     const handleConfirmDelete = useCallback(() => {
//         setDeleteModalVisible(true);
//     }, []);

//     // Hide delete confirmation modal
//     const handleHideDeleteConfirm = useCallback(() => {
//         setDeleteModalVisible(false);
//     }, []);

//     // Handle user deletion
//     const handleDelete = useCallback(async () => {
//         try {
//             setIsDeleting(true);
//             await deleteMutation.mutateAsync(userId);
//             message.success('User deleted successfully');
//             Navigation.Users.toList();
//         } catch (error) {
//             console.error('Error deleting user:', error);
//             message.error('Failed to delete user');
//         } finally {
//             setIsDeleting(false);
//             setDeleteModalVisible(false);
//         }
//     }, [userId, deleteMutation]);

//     // Create the actions object for the success state
//     const actions = {
//         refresh: () => { userQuery.refetch() },
//         edit: handleEdit,
//         back: handleBack,
//         delete: handleDelete,
//         confirmDelete: handleConfirmDelete,
//         hideDeleteConfirm: handleHideDeleteConfirm,
//     };

//     // Check permissions
//     const canEditUser = AuthManager.instance.hasPermission(Actions.USER_UPDATE);
//     const canDeleteUser = AuthManager.instance.hasPermission(Actions.USER_DELETE);

//     // Map the query to our AsyncState pattern
//     const userState = mapQueryToAsyncState(userQuery, {
//         loadingMessage: 'Loading user details...',
//         onSuccess: (data) => new UserDetailsSuccessState({
//             user: data,
//             actions,
//             isDeleting,
//             deleteModalVisible,
//             canDeleteUser,
//             canEditUser,
//         })
//     });

//     return {
//         userState,
//         roleState: {
//             role: roleQuery?.data,
//             actions: roleActionsQuery?.data || [],
//             loading: roleQuery?.isLoading || roleActionsQuery?.isLoading || false
//         },
//         isDeleting,
//         deleteModalVisible,
//         actions
//     };
// };
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { Navigation } from '@/app';
import { AsyncState, mapQueryToAsyncState, UI_STATE_TYPE, SuccessState } from '@/lib/state';
import { User } from '@/models';
import { AuthManager } from '@/managers/auth';
import { Actions } from '@/managers/auth/permission';
import { UserQueries } from '../user.queries';
import { RoleQueries } from '@/features/role';

interface UserDetailsSuccessStateArgs {
    user: User;
    actions: {
        refresh: () => void;
        edit: () => void;
        back: () => void;
        delete: () => Promise<void>;
        confirmDelete: () => void;
        hideDeleteConfirm: () => void;
    };
    isDeleting: boolean;
    deleteModalVisible: boolean;
    canDeleteUser?: boolean;
    canEditUser?: boolean;
}

/**
 * Custom success state for user details
 */
export class UserDetailsSuccessState extends SuccessState<User> {
    constructor(args: UserDetailsSuccessStateArgs) {
        super(args.user, { refresh: args.actions.refresh });
        this.actions = args.actions;
        this.isDeleting = args.isDeleting;
        this.deleteModalVisible = args.deleteModalVisible;
        this.canDeleteUser = args.canDeleteUser ?? true;
        this.canEditUser = args.canEditUser ?? true;
    }

    public readonly actions: UserDetailsSuccessStateArgs['actions'];
    public readonly isDeleting: boolean;
    public readonly deleteModalVisible: boolean;
    public readonly canDeleteUser: boolean;
    public readonly canEditUser: boolean;

    static is(state: AsyncState<any>): state is UserDetailsSuccessState {
        if (state.type !== UI_STATE_TYPE.SUCCESS) return false;

        const typedState = state as unknown as Record<string, unknown>;

        // Check required properties existence and types
        if (!('actions' in typedState) || typeof typedState.actions !== 'object' || !typedState.actions) return false;
        if (!('isDeleting' in typedState) || typeof typedState.isDeleting !== 'boolean') return false;
        if (!('deleteModalVisible' in typedState) || typeof typedState.deleteModalVisible !== 'boolean') return false;
        if (!('canDeleteUser' in typedState) || typeof typedState.canDeleteUser !== 'boolean') return false;
        if (!('canEditUser' in typedState) || typeof typedState.canEditUser !== 'boolean') return false;

        // Check actions object structure
        const actions = typedState.actions as Record<string, unknown>;
        const requiredActions = ['refresh', 'edit', 'back', 'delete', 'confirmDelete', 'hideDeleteConfirm'];
        return requiredActions.every(action => action in actions && typeof actions[action] === 'function');
    }
}

/**
 * Hook for managing user details page
 * Handles data fetching, state management, and actions
 */
export const useUserDetails = () => {
    // Get user ID from URL params
    const { id: userId = '' } = useParams<{ id: string }>();

    // State for delete modal and loading
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch user data
    const userQuery = UserQueries.useDetail(userId);

    // Always call the hooks, but use the enabled property to conditionally fetch
    const roleId = userQuery.data?.roleId;
    const roleQuery = RoleQueries.useDetail(roleId || '');

    // Always call the actions hook, but only fetch data if roleId exists
    const roleActionsQuery = RoleQueries.useActions(roleId || '');

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

    // Check permissions
    const canEditUser = AuthManager.instance.hasPermission(Actions.USER_UPDATE);
    const canDeleteUser = AuthManager.instance.hasPermission(Actions.USER_DELETE);

    // Map the query to our AsyncState pattern
    const userState = mapQueryToAsyncState(userQuery, {
        loadingMessage: 'Loading user details...',
        onSuccess: (data) => new UserDetailsSuccessState({
            user: data,
            actions,
            isDeleting,
            deleteModalVisible,
            canDeleteUser,
            canEditUser,
        })
    });

    return {
        userState,
        roleState: {
            role: roleQuery?.data,
            actions: roleActionsQuery?.data || [],
            loading: roleQuery?.isLoading || roleActionsQuery?.isLoading || false,
            error: roleQuery?.isError || roleActionsQuery?.isError || false
        },
        isDeleting,
        deleteModalVisible,
        actions
    };
};