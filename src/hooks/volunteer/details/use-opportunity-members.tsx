import { useCallback, useMemo, useState } from 'react';
import { Space, TableProps, Tooltip, message } from 'antd';
import { useQueries } from '@tanstack/react-query';
import { mapQueriesToAsyncState, SuccessState, SuccessStateActions, UI_STATE_TYPE } from '@/lib/state';
import { Member, Interest } from '@/models';
import { QueryKeys } from '@/lib/query';
import { CreateInterestDTO, InterestManager } from '@/data/interest';
import { InterestQueries } from '@/data/interest/interest.queries';
import { VolunteerQueries } from '@/data/volunteer';
import { AuthenticationManager } from '@/data/authentication';
import { Actions } from '@/data/authorization';
import { useAppNavigation } from '@/app';
import NiceModal from '@ebay/nice-modal-react';
import { ConfirmDeleteModal } from '@/components/shared';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { notifyUtils } from '@/utilities';

// Define interface for opportunity members success state actions
interface OpportunityMembersSuccessStateActions extends SuccessStateActions {
  refresh: () => void;
  changePage: (page: number, pageSize?: number) => void;
  addMember: (memberId: string) => Promise<boolean>;
  removeMember: (interestId: string, memberName: string) => void;
  viewMemberDetails: (memberId: string) => void;
  openMemberSelector: () => void;
  closeMemberSelector: () => void;
}

/**
 * Custom success state class for opportunity members
 */
export class OpportunityMembersSuccessState extends SuccessState<{
  opportunityId: string;
  opportunityName: string;
  members: Member[];
  interests: Interest[];
  total: number;
}> {
  readonly opportunityId: string;
  readonly opportunityName: string;
  readonly members: Member[];
  readonly interests: Interest[];
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
  readonly memberSelectorVisible: boolean;

  override actions: OpportunityMembersSuccessStateActions;

  constructor(args: {
    data: {
      opportunityId: string;
      opportunityName: string;
      members: Member[];
      interests: Interest[];
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
    memberSelectorVisible?: boolean;
    actions: OpportunityMembersSuccessStateActions;
  }) {
    super(args.data, args.actions);
    this.opportunityId = args.data.opportunityId;
    this.opportunityName = args.data.opportunityName;
    this.members = args.data.members;
    this.interests = args.data.interests;
    this.total = args.data.total;
    this.tableProps = args.tableProps;
    this.pagination = args.pagination;
    this.isLoading = args.isLoading;
    this.canAddMembers = args.canAddMembers;
    this.canRemoveMembers = args.canRemoveMembers;
    this.canViewMembers = args.canViewMembers;
    this.memberSelectorVisible = args.memberSelectorVisible || false;
    this.actions = args.actions;
  }

  // Public methods that expose the actions
  refresh(): void {
    this.actions.refresh();
  }

  changePage(page: number, pageSize?: number): void {
    this.actions.changePage(page, pageSize);
  }

  addMember(memberId: string): Promise<boolean> {
    return this.actions.addMember(memberId);
  }

  removeMember(interestId: string, memberName: string) {
    return this.actions.removeMember(interestId, memberName);
  }

  viewMemberDetails(memberId: string): void {
    this.actions.viewMemberDetails(memberId);
  }

  // Get interest ID for a member
  getInterestId(memberId: string): string | undefined {
    const interest = this.interests.find(interest => interest.memberId === memberId);
    return interest?.id;
  }

  // Type guard to verify this state type
  static is(state: any): state is OpportunityMembersSuccessState {
    return (
      state.type === UI_STATE_TYPE.SUCCESS &&
      "opportunityId" in state &&
      "members" in state &&
      "interests" in state &&
      "tableProps" in state
    );
  }
}

/**
 * Hook for managing members interested in an opportunity
 * 
 * @param opportunityId The ID of the opportunity
 * @param isTabActive Whether the members tab is currently active
 */
export const useOpportunityMembers = (opportunityId: string, isTabActive: boolean = true) => {
  const navigate = useAppNavigation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [memberSelectorVisible, setMemberSelectorVisible] = useState(false);

  // Permission checks
  const canAddMembers = AuthenticationManager.instance.hasPermission(Actions.OPPORTUNITY_CREATE);
  const canRemoveMembers = AuthenticationManager.instance.hasPermission(Actions.OPPORTUNITY_DELETE_BY_ID);
  const canViewMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_FIND_BY_ID);

  // Create and delete interest mutations
  const createInterestMutation = InterestQueries.useCreate();
  const deleteInterestMutation = InterestQueries.useDelete();

  // Queries for interests data and opportunity details
  const [interestsQuery, opportunityQuery] = useQueries({
    queries: [
      {
        queryKey: QueryKeys.Interests.byOpportunity(opportunityId),
        queryFn: () => InterestManager.instance.getInterestsByOpportunityId(opportunityId),
        enabled: !!opportunityId && isTabActive,
      },
      {
        ...VolunteerQueries.useDetail(opportunityId),
        queryKey: QueryKeys.Volunteers.opportunityDetail(opportunityId),
        enabled: !!opportunityId,
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

  // Handle opening the member selector
  const handleOpenMemberSelector = useCallback(() => {
    setMemberSelectorVisible(true);
  }, []);

  // Handle closing the member selector
  const handleCloseMemberSelector = useCallback(() => {
    setMemberSelectorVisible(false);
  }, []);

  // Handle adding a member to the opportunity
  const handleAddMember = useCallback(async (memberId: string) => {
    const toastId = notifyUtils.showLoading("Adding member to opportunity...");

    try {
      // Create a new interest
      const interestData: CreateInterestDTO = {
        memberId,
        opportunityId
      };

      await createInterestMutation.mutateAsync(interestData);
      notifyUtils.dismiss(toastId);
      notifyUtils.success('Member added to opportunity successfully');
      handleCloseMemberSelector();
      return true;
    } catch (error) {
      notifyUtils.dismiss(toastId);
      console.error('Error adding member to opportunity:', error);
      notifyUtils.error('Failed to add member to opportunity');
      return false;
    }
  }, [opportunityId, createInterestMutation, handleCloseMemberSelector]);

  // Handle removing a member from the opportunity
  const handleRemoveMember = useCallback(async (interestId: string) => {
    try {
      await deleteInterestMutation.mutateAsync(interestId);
      message.success('Member removed from opportunity successfully');
      interestsQuery.refetch();
      return true;
    } catch (error) {
      console.error('Error removing member from opportunity:', error);
      message.error('Failed to remove member from opportunity');
      return false;
    }
  }, [deleteInterestMutation, interestsQuery]);

  // Show confirmation dialog for removing a member
  const showRemoveMemberConfirm = useCallback((interestId: string, memberName: string) => {
    NiceModal.show(ConfirmDeleteModal, {
      title: 'Remove Member',
      resourceName: memberName,
      message: 'Are you sure you want to remove this member from the volunteer opportunity?',
      isDeleting: false,
      onDelete: async () => {
        return handleRemoveMember(interestId);
      }
    });
  }, [handleRemoveMember]);

  // Navigate to member details
  const handleViewMemberDetails = useCallback((memberId: string) => {
    navigate.Members.toDetails(memberId);
  }, [navigate]);

  // Extract member data from interests
  const members = useMemo(() => {
    if (!interestsQuery.data) return [];

    return interestsQuery.data
      .filter(interest => interest.member)
      .map(interest => interest.member!);
  }, [interestsQuery.data]);

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
      title: 'Fellowship',
      key: 'fellowship',
      render: (_: any, member: Member) => member.getFellowshipName() || 'Not assigned',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, member: Member) => {
        // Find the interest ID for this member (needed for removal)
        const interest = interestsQuery.data?.find(i => i.memberId === member.id);

        return (
          <Space size="middle" className="table-actions">
            {canViewMembers && (
              <Tooltip title="View Details">
                <EyeOutlined
                  onClick={() => handleViewMemberDetails(member.id)}
                  style={{ cursor: 'pointer' }}
                />
              </Tooltip>
            )}
            {canRemoveMembers && interest && (
              <Tooltip title="Remove Member">
                <DeleteOutlined
                  onClick={() => showRemoveMemberConfirm(interest.id, member.getFullName())}
                  style={{ cursor: 'pointer', color: '#ff4d4f' }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ], [canViewMembers, canRemoveMembers, handleViewMemberDetails, showRemoveMemberConfirm, interestsQuery.data]);

  // Create table props
  const tableProps = useMemo<TableProps<Member>>(() => ({
    columns,
    dataSource: members,
    rowKey: 'id',
    pagination: {
      current: currentPage,
      pageSize: pageSize,
      total: members.length,
      onChange: handlePageChange,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} interested members`,
    },
    loading: interestsQuery.isLoading || interestsQuery.isFetching,
  }), [
    columns,
    members,
    interestsQuery.isLoading,
    interestsQuery.isFetching,
    currentPage,
    pageSize,
    handlePageChange
  ]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    interestsQuery.refetch();
  }, [interestsQuery]);

  // Map queries to AsyncState
  return mapQueriesToAsyncState(
    [interestsQuery, opportunityQuery] as const,
    {
      loadingMessage: 'Loading interested members...',
      resourceType: 'Opportunity Members',
      resourceId: opportunityId,
      onSuccess: ([interests, opportunity]) => {
        return new OpportunityMembersSuccessState({
          data: {
            opportunityId,
            opportunityName: opportunity?.name || 'Unknown Opportunity',
            members,
            interests,
            total: members.length,
          },
          tableProps,
          pagination: {
            current: currentPage,
            pageSize,
            total: members.length,
          },
          isLoading: interestsQuery.isLoading || interestsQuery.isFetching,
          canAddMembers,
          canRemoveMembers,
          canViewMembers,
          memberSelectorVisible,
          actions: {
            refresh: handleRefresh,
            changePage: handlePageChange,
            addMember: handleAddMember,
            removeMember: showRemoveMemberConfirm,
            viewMemberDetails: handleViewMemberDetails,
            openMemberSelector: () => handleOpenMemberSelector(),
            closeMemberSelector: handleCloseMemberSelector,
          }
        });
      }
    }
  )
}