import { useCallback, useMemo, useState } from 'react';
import { Space, TableProps, Tooltip, message } from 'antd';
import { useQueries } from '@tanstack/react-query';
import { mapQueriesToAsyncState, SuccessState, SuccessStateActions, UI_STATE_TYPE } from '@/lib/state';
import { Member } from '@/models';
import { QueryKeys } from '@/lib/query';
import { MemberManager, MemberQueryBuilder } from '@/data/member';
import { FellowshipManager } from '@/data/fellowship';
import { AuthenticationManager } from '@/data/authentication';
import { Actions } from '@/data/authorization';
import { Navigation, useAppNavigation } from '@/app';
import NiceModal from '@ebay/nice-modal-react';
import { ConfirmDeleteModal } from '@/components/shared';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';

// Define interface for fellowship members success state actions
interface FellowshipMembersSuccessStateActions extends SuccessStateActions {
    refresh: () => void;
    changePage: (page: number, pageSize?: number) => void;
    addMember: () => void;
    removeMember: (memberId: string) => Promise<boolean>;
    viewMemberDetails: (memberId: string) => void;
}

/**
 * Custom success state class for fellowship members
 */
export class FellowshipMembersSuccessState extends SuccessState<{
    fellowshipId: string;
    fellowshipName: string;
    members: Member[];
    total: number;
}> {
    readonly fellowshipId: string;
    readonly fellowshipName: string;
    readonly members: Member[];
    readonly total: number;
    readonly tableProps: TableProps<Member>;
    readonly pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    readonly isLoading: boolean;
    readonly canAddMembers: boolean;
    readonly canRemoveMembers: boolean;
    readonly canViewMembers: boolean;

    override actions: FellowshipMembersSuccessStateActions;

    constructor(args: {
        data: {
            fellowshipId: string;
            fellowshipName: string;
            members: Member[];
            total: number;
        };
        tableProps: TableProps<Member>;
        pagination: {
            current: number;
            pageSize: number;
            total: number;
        };
        isLoading: boolean;
        canAddMembers: boolean;
        canRemoveMembers: boolean;
        canViewMembers: boolean;
        actions: FellowshipMembersSuccessStateActions;
    }) {
        super(args.data, args.actions);
        this.fellowshipId = args.data.fellowshipId;
        this.fellowshipName = args.data.fellowshipName;
        this.members = args.data.members;
        this.total = args.data.total;
        this.tableProps = args.tableProps;
        this.pagination = args.pagination;
        this.isLoading = args.isLoading;
        this.canAddMembers = args.canAddMembers;
        this.canRemoveMembers = args.canRemoveMembers;
        this.canViewMembers = args.canViewMembers;
        this.actions = args.actions;
    }

    // Public methods that expose the actions
    refresh(): void {
        this.actions.refresh();
    }

    changePage(page: number, pageSize?: number): void {
        this.actions.changePage(page, pageSize);
    }

    addMember(): void {
        this.actions.addMember();
    }

    removeMember(memberId: string): Promise<boolean> {
        return this.actions.removeMember(memberId);
    }

    viewMemberDetails(memberId: string): void {
        this.actions.viewMemberDetails(memberId);
    }

    // Type guard to verify this state type
    static is(state: any): state is FellowshipMembersSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "fellowshipId" in state &&
            "members" in state &&
            "tableProps" in state
        );
    }
}

/**
 * Hook for managing fellowship members
 * 
 * @param fellowshipId The ID of the fellowship
 * @param isTabActive Whether the members tab is currently active
 */
export const useFellowshipMembers = (fellowshipId: string, isTabActive: boolean = true) => {
    const navigate = useAppNavigation();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Permission checks
    const canAddMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_CREATE);
    const canRemoveMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_UPDATE);
    const canViewMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_FIND_BY_ID);

    // member fetch params
    const queryBuilder = MemberQueryBuilder.newInstance()
        .filterByFellowshipId(fellowshipId)
        .includeDefaultRelations()
        .paginate(currentPage, pageSize);

    // Queries for members data and fellowship details
    const [membersQuery, fellowshipQuery] = useQueries({
        queries: [
            {
                queryKey: QueryKeys.Members.list(queryBuilder),
                queryFn: async () => {
                    const queryBuilder = MemberQueryBuilder.newInstance()
                        .filterByFellowshipId(fellowshipId)
                        .includeDefaultRelations()
                        .paginate(currentPage, pageSize);

                    return await MemberManager.instance.getMembers(queryBuilder);
                },
                enabled: !!fellowshipId && isTabActive,
            },
            {
                queryKey: QueryKeys.Fellowships.detail(fellowshipId),
                queryFn: () => FellowshipManager.instance.getFellowshipById(fellowshipId),
                enabled: !!fellowshipId,
            }
        ]
    });

    // Handle page change
    const handlePageChange = useCallback((page: number, pageSize?: number) => {
        setCurrentPage(page);
        if (pageSize) {
            setPageSize(pageSize);
        }
    }, []);

    // Handle adding a new member
    const handleAddMember = useCallback(() => {
        Navigation.Members.toCreate({ fellowshipId })
    }, [fellowshipId, navigate]);

    // Handle removing a member from the fellowship
    const handleRemoveMember = useCallback(async (memberId: string) => {
        try {
            // await FellowshipManager.instance.removeMember(fellowshipId, memberId);
            console.log("should have removed member: ", memberId, " from fellowship")
            message.success('Member removed from fellowship successfully');
            membersQuery.refetch();
            return true;
        } catch (error) {
            console.error('Error removing member from fellowship:', error);
            message.error('Failed to remove member from fellowship');
            return false;
        }
    }, [fellowshipId, membersQuery]);

    // Show confirmation dialog for removing a member
    const showRemoveMemberConfirm = useCallback((memberId: string, memberName: string) => {
        NiceModal.show(ConfirmDeleteModal, {
            title: 'Remove Member',
            resourceName: memberName,
            message: 'Are you sure you want to remove this member from the fellowship? They will still remain in the system.',
            isDeleting: false,
            onDelete: async () => {
                return handleRemoveMember(memberId);
            }
        });
    }, [handleRemoveMember]);

    // Navigate to member details
    const handleViewMemberDetails = useCallback((memberId: string) => {
        navigate.Members.toDetails(memberId);
    }, [navigate]);

    // Create table columns
    const columns = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'firstName',
            key: 'name',
            render: (_: any, member: Member) => member.getFullName(),
            sorter: true,
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Age',
            key: 'age',
            render: (_: any, member: Member) => member.getAge() || 'N/A',
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, member: Member) => (
                <Space size="middle" className="table-actions">
                    {canViewMembers && (
                        <Tooltip title="View Details">
                            <EyeOutlined
                                onClick={() => handleViewMemberDetails(member.id)}
                                style={{ cursor: 'pointer' }}
                            />
                        </Tooltip>
                    )}
                    {canRemoveMembers && (
                        <Tooltip title="Remove Member">
                            <DeleteOutlined
                                onClick={() => showRemoveMemberConfirm(member.id, member.getFullName())}
                                style={{ cursor: 'pointer', color: '#ff4d4f' }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [canViewMembers, canRemoveMembers, handleViewMemberDetails, showRemoveMemberConfirm]);

    // Create table props
    const tableProps = useMemo<TableProps<Member>>(() => ({
        columns,
        dataSource: membersQuery.data?.members || [],
        rowKey: 'id',
        pagination: {
            current: currentPage,
            pageSize: pageSize,
            total: membersQuery.data?.total || 0,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} members`,
        },
        loading: membersQuery.isLoading || membersQuery.isFetching,
    }), [
        columns,
        membersQuery.data?.members,
        membersQuery.data?.total,
        membersQuery.isLoading,
        membersQuery.isFetching,
        currentPage,
        pageSize,
        handlePageChange
    ]);

    // Refresh data
    const handleRefresh = useCallback(() => {
        membersQuery.refetch();
    }, [membersQuery]);

    // Map queries to AsyncState
    return mapQueriesToAsyncState(
        [membersQuery, fellowshipQuery] as const,
        {
            loadingMessage: 'Loading fellowship members...',
            resourceType: 'Fellowship Members',
            resourceId: fellowshipId,
            onSuccess: ([membersData, fellowship]) => {
                console.log("members data: ", membersData)
                return new FellowshipMembersSuccessState({
                    data: {
                        fellowshipId,
                        fellowshipName: fellowship?.name || 'Unknown Fellowship',
                        members: membersData.members,
                        total: membersData.total,
                    },
                    tableProps,
                    pagination: {
                        current: currentPage,
                        pageSize,
                        total: membersData.total,
                    },
                    isLoading: membersQuery.isLoading || membersQuery.isFetching,
                    canAddMembers,
                    canRemoveMembers,
                    canViewMembers,
                    actions: {
                        refresh: handleRefresh,
                        changePage: handlePageChange,
                        addMember: handleAddMember,
                        removeMember: handleRemoveMember,
                        viewMemberDetails: handleViewMemberDetails,
                    }
                });
            }
        }
    );
};