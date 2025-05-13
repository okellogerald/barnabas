import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AsyncState, mapQueryToAsyncState, UI_STATE_TYPE, SuccessState } from '@/lib/state';
import { Role, RoleAction } from '@/models';
import { Navigation } from '@/app';
import { RoleQueries } from '@/data/role/role.queries';

/**
 * Custom success state for role details
 */
export class RoleDetailsSuccessState extends SuccessState<Role> {
    readonly roleActions: RoleAction[];
    readonly isLoading: boolean;

    constructor(
        role: Role,
        actions: RoleAction[],
        isLoading: boolean,
        refreshCallback: () => void
    ) {
        super(role, { refresh: refreshCallback });
        this.roleActions = actions;
        this.isLoading = isLoading;
    }

    static is(state: AsyncState<any>): state is RoleDetailsSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            'roleActions' in state &&
            'isLoading' in state
        );
    }
}

/**
 * Hook for managing role details page
 * Handles data fetching for role and its actions
 */
export const useRoleDetails = () => {
    // Get role ID from URL params
    const { id: roleId = '' } = useParams<{ id: string }>();

    // Fetch role data
    const roleQuery = RoleQueries.useDetail(roleId);

    // Fetch role actions
    const actionsQuery = RoleQueries.useActions(roleId);

    // Handle back navigation
    const handleBack = useCallback(() => {
        Navigation.Roles.toList();
    }, []);

    // Create the actions object for the component
    const uiActions = {
        back: handleBack,
        refresh: () => {
            roleQuery.refetch();
            actionsQuery.refetch();
        }
    };

    // Map the query to our AsyncState pattern
    const roleState = mapQueryToAsyncState(roleQuery, {
        loadingMessage: 'Loading role details...',
        onSuccess: (data) => new RoleDetailsSuccessState(
            data,
            actionsQuery.data || [],
            roleQuery.isLoading || actionsQuery.isLoading,
            uiActions.refresh
        )
    });

    return {
        roleState,
        uiActions
    };
};