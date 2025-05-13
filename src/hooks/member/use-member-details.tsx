import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import NiceModal, { useModal, create } from '@ebay/nice-modal-react';

import { Member } from '@/models';
import {
  isSuccessState,
  mapQueryToAsyncState,
  StateFactory,
  SuccessState,
  SuccessStateActions
} from '@/lib/state';
import { useAppNavigation } from '@/app';
import { notifyUtils } from '@/utilities/notification.utils';
import { MemberQueries } from '@/data/member';

/**
 * Extended actions interface for member details
 */
export interface MemberDetailsSuccessStateActions extends SuccessStateActions {
  delete: () => void;
  print: () => void;
  edit: () => void;
  goToList: () => void;
}

/**
 * Member details success state with domain-specific methods
 */
export class MemberDetailsSuccessState extends SuccessState<Member> {
  override readonly actions: MemberDetailsSuccessStateActions;
  readonly isDeleting: boolean;

  constructor(
    public member: Member,
    isDeleting: boolean,
    actions: MemberDetailsSuccessStateActions
  ) {
    super(member, actions);
    this.actions = actions;
    this.isDeleting = isDeleting;
  }

  // Type guard for safer state checking
  static is(state: any): state is MemberDetailsSuccessState {
    return isSuccessState(state) && "member" in state;
  }
  
  // Helper methods to get commonly used member info
  getFullName(): string {
    return this.member.getFullName();
  }
  
  getMemberAge(): number | null {
    return this.member.getAge();
  }
  
  getDependantCount(): number {
    return this.member.dependants.length;
  }
  
  getFellowshipName(): string {
    return this.member.getFellowshipName();
  }
}

// Props for the delete confirmation modal
interface DeleteMemberModalProps {
  member: Member;
  onConfirm: () => Promise<void>;
}

/**
 * Delete Member Modal Component
 * Displays a confirmation dialog for member deletion using NiceModal
 */
export const DeleteMemberModal = create(({ member, onConfirm }: DeleteMemberModalProps) => {
  const modal = useModal();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle the confirmation action
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      modal.hide();
    } catch (error) {
      // Error is handled by the mutation error callback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Delete Member"
      open={modal.visible}
      onOk={handleConfirm}
      onCancel={() => modal.hide()}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      confirmLoading={isLoading}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px', marginTop: '2px' }} />
        <div>
          <p>Are you sure you want to delete <strong>{member.getFullName()}</strong>?</p>
          <p>This action cannot be undone and will remove all associated data.</p>
          {member.dependants.length > 0 && (
            <p><strong>Warning:</strong> This member has {member.dependants.length} dependant(s) that will also be removed.</p>
          )}
        </div>
      </div>
    </Modal>
  );
});

/**
 * Custom hook for member details view
 * Manages the state, data fetching, and actions for the member details page
 */
export const useMemberDetails = () => {
  const { id: memberId } = useParams<{ id: string }>();
  const navigate = useAppNavigation();

  // Fetch member data
  const memberQuery = MemberQueries.useDetail(memberId ?? "");
  
  // Delete member mutation
  const deleteMutation = MemberQueries.useDelete(
    memberId ?? "",
    {
      onSuccess: () => {
        notifyUtils.success('Member successfully deleted');
        navigate.Members.toList();
      },
      onError: (error) => {
        notifyUtils.error('Failed to delete member', error instanceof Error ? error.message : 'Unknown error');
      },
    }
  );

  // Handle member deletion with NiceModal
  const handleDeleteMember = useCallback(() => {
    if (!memberQuery.data) return;
    
    NiceModal.show(DeleteMemberModal, {
      member: memberQuery.data,
      onConfirm: async () => {
        if (!memberId) return;
        await deleteMutation.mutateAsync(memberId);
      }
    });
  }, [memberId, memberQuery.data, deleteMutation]);

  // Handle print functionality
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle edit navigation
  const handleEdit = useCallback(() => {
    if (memberId) {
      navigate.Members.toEdit(memberId);
    }
  }, [memberId, navigate]);

  // Handle navigation to list
  const handleGoToList = useCallback(() => {
    navigate.Members.toList();
  }, [navigate]);

  // Map query to our state classes
  return mapQueryToAsyncState(memberQuery, {
    loadingMessage: `Loading member details...`,
    resourceType: "Member",
    resourceId: memberId,
    onSuccess: (member) => {
      // Create properly typed actions object
      const actions: MemberDetailsSuccessStateActions = {
        refresh: () => memberQuery.refetch(),
        delete: handleDeleteMember,
        print: handlePrint,
        edit: handleEdit,
        goToList: handleGoToList
      };

      return new MemberDetailsSuccessState(
        member, 
        deleteMutation.isPending,
        actions
      );
    },
    customErrorMapping: (error) => {
      // Handle not found errors
      if (error instanceof Error && error.message.includes('not found')) {
        return StateFactory.notFound({
          message: `Member with ID ${memberId} not found`,
          resourceType: "Member",
          resourceId: memberId || '',
          actions: {
            goBack: () => window.history.back(),
            retry: () => memberQuery.refetch(),
            goToList: handleGoToList
          }
        });
      }

      // Handle unauthorized errors
      if (error instanceof Error && error.message.includes('permission')) {
        return StateFactory.unauthorized({
          message: 'You do not have permission to view member details',
          requiredPermissions: ['member.findById'],
          actions: {
            goBack: () => window.history.back(),
            retry: () => memberQuery.refetch()
          }
        });
      }

      // Return null to let the default error handling take over
      return null;
    }
  });
};