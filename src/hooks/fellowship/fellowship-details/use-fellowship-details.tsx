import { useCallback } from 'react';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import { mapQueriesToAsyncState, SuccessState, SuccessStateActions, UI_STATE_TYPE } from '@/lib/state';
import { Navigation, useAppNavigation } from '@/app';
import { FellowshipManager, FellowshipQueries } from '@/data/fellowship';
import { useQueries } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query';
import { Fellowship } from '@/models';
import NiceModal from '@ebay/nice-modal-react';
import { AuthenticationManager } from '@/data/authentication';
import { Actions } from '@/data/authorization';
import { ConfirmDeleteModal } from '@/components/shared';
import { MemberManager } from '@/data/member';

// Define the interface for fellowship details success state actions
interface FellowshipDetailsSuccessStateActions extends SuccessStateActions {
    refresh: () => void;
    edit: () => void;
    back: () => void;
    addMember: () => void;
    viewMembers: () => void;
    showDeleteConfirm: () => void;
    delete: () => Promise<boolean | undefined>;
}

/**
 * Custom success state class for fellowship details
 */
export class FellowshipDetailsSuccessState extends SuccessState<{
    fellowship: Fellowship;
    membersCount: number;
}> {
    readonly fellowship: Fellowship;
    readonly membersCount: number;
    readonly isDeleting: boolean;
    readonly canEdit: boolean;
    readonly canDelete: boolean;
    readonly canAddMembers: boolean;

    override actions: FellowshipDetailsSuccessStateActions;

    constructor(args: {
        data: {
            fellowship: Fellowship;
            membersCount: number;
        };
        isDeleting: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canAddMembers: boolean;
        actions: FellowshipDetailsSuccessStateActions;
    }) {
        super(args.data, args.actions);
        this.fellowship = args.data.fellowship;
        this.membersCount = args.data.membersCount;
        this.isDeleting = args.isDeleting;
        this.canEdit = args.canEdit;
        this.canDelete = args.canDelete;
        this.canAddMembers = args.canAddMembers;
        this.actions = args.actions;
    }

    // Public methods that expose the actions
    edit(): void {
        this.actions.edit();
    }

    back(): void {
        this.actions.back();
    }

    addMember(): void {
        this.actions.addMember();
    }

    viewMembers(): void {
        this.actions.viewMembers();
    }

    showDeleteConfirm(): void {
        this.actions.showDeleteConfirm();
    }

    delete(): Promise<boolean | undefined> {
        return this.actions.delete();
    }

    // Type guard to verify this state type
    static is(state: any): state is FellowshipDetailsSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "fellowship" in state &&
            "membersCount" in state &&
            "canEdit" in state &&
            "canDelete" in state &&
            "canAddMembers" in state
        );
    }
}

/**
 * Hook for managing fellowship details view
 * 
 * Provides data fetching, actions, and navigation for viewing and managing a fellowship
 */
export const useFellowshipDetails = () => {
    // Get fellowship ID from URL
    const { id } = useParams<{ id: string }>();
    const navigate = useAppNavigation();

    // Permission checks
    const canEdit = AuthenticationManager.instance.hasPermission(Actions.FELLOWSHIP_UPDATE);
    const canDelete = AuthenticationManager.instance.hasPermission(Actions.FELLOWSHIP_DELETE_BY_ID);
    const canAddMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_CREATE);

    // Use delete mutation
    const deleteMutation = FellowshipQueries.useDelete();

    // Combined queries
    const [fellowshipQuery, membersCountQuery] = useQueries({
        queries: [
            {
                queryKey: QueryKeys.Fellowships.detail(id || ''),
                queryFn: () => FellowshipManager.instance.getFellowshipById(id || ''),
                enabled: !!id,
            },
            {
                queryKey: QueryKeys.Members.count(),
                queryFn: () => MemberManager.instance.getMembersCount({ fellowshipId: id }),
                enabled: !!id,
            }
        ]
    });

    // Action callbacks
    const handleEdit = useCallback(() => {
        if (!id) return;
        navigate.Fellowships.toEdit(id);
    }, [id, navigate]);

    const handleBack = useCallback(() => {
        navigate.Fellowships.toList();
    }, [navigate]);

    const handleAddMember = useCallback(() => {
        if (!id) return;
        Navigation.Members.toCreate({ fellowshipId: id });
    }, [id]);

    const handleViewMembers = useCallback(() => {
        if (!id) return;
        Navigation.Members.toList({ fellowshipId: id });
    }, [id]);

    const handleShowDeleteConfirm = useCallback(() => {
        if (!id) return;

        NiceModal.show(ConfirmDeleteModal, {
            title: 'Delete Fellowship',
            resourceName: fellowshipQuery.data?.name || 'fellowship',
            message: 'Are you sure you want to delete this fellowship? This action cannot be undone. Members will remain in the system but will no longer be associated with this fellowship.',
            isDeleting: deleteMutation.isPending,
            onDelete: async () => {
                try {
                    await deleteMutation.mutateAsync(id);
                    message.success('Fellowship deleted successfully');
                    Navigation.Fellowships.toList();
                    return true;
                } catch (error) {
                    console.error('Error deleting fellowship:', error);
                    message.error('Failed to delete fellowship. Please try again.');
                    return false;
                }
            }
        });
    }, [id, deleteMutation, fellowshipQuery.data?.name]);

    const handleDelete = useCallback(async () => {
        if (!id) return;

        try {
            await deleteMutation.mutateAsync(id);
            message.success('Fellowship deleted successfully');
            Navigation.Fellowships.toList();
            return true;
        } catch (error) {
            console.error('Error deleting fellowship:', error);
            message.error('Failed to delete fellowship. Please try again.');
            return false;
        }
    }, [id, deleteMutation]);

    const handleRefresh = useCallback(() => {
        fellowshipQuery.refetch();
        if (id) {
            membersCountQuery.refetch();
        }
    }, [id, fellowshipQuery, membersCountQuery]);

    // Map queries to our enhanced AsyncState
    return mapQueriesToAsyncState(
        [fellowshipQuery, membersCountQuery] as const,
        {
            loadingMessage: 'Loading fellowship details...',
            resourceType: 'Fellowship',
            resourceId: id,
            onSuccess: ([fellowship, membersCount]) => {
                return new FellowshipDetailsSuccessState({
                    data: {
                        fellowship,
                        membersCount: membersCount || 0,
                    },
                    isDeleting: deleteMutation.isPending,
                    canEdit,
                    canDelete,
                    canAddMembers,
                    actions: {
                        refresh: handleRefresh,
                        edit: handleEdit,
                        back: handleBack,
                        addMember: handleAddMember,
                        viewMembers: handleViewMembers,
                        showDeleteConfirm: handleShowDeleteConfirm,
                        delete: handleDelete,
                    }
                });
            }
        }
    );
};
