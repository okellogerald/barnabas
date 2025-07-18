import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import NiceModal, { useModal, create } from '@ebay/nice-modal-react';
import { useQueries } from '@tanstack/react-query';

import { Envelope, Member } from '@/models';
import {
  isSuccessState,
  mapQueriesToAsyncState,
  StateFactory,
  SuccessState,
  SuccessStateActions
} from '@/lib/state';
import { useAppNavigation } from '@/app';
import { notifyUtils } from '@/utilities/notification.utils';
import { MemberQueries } from '@/data/member';
import { EnvelopeQueries, EnvelopeManager } from '@/data/envelope';
import { QueryKeys } from '@/lib/query';

/**
 * Extended actions interface for member details with envelope actions
 */
export interface MemberDetailsSuccessStateActions extends SuccessStateActions {
  delete: () => void;
  print: () => void;
  edit: () => void;
  goToList: () => void;
  assignEnvelope: (envelopeId: string) => Promise<void>;
  releaseEnvelope: () => Promise<void>;
  selectEnvelope: (envelopeId: string | null) => void;
}

/**
 * Member details success state with domain-specific methods and envelope data
 */
export class MemberDetailsSuccessState extends SuccessState<Member> {
  override readonly actions: MemberDetailsSuccessStateActions;
  readonly isDeleting: boolean;
  readonly availableEnvelopes: Envelope[] | null;
  readonly isAssigningEnvelope: boolean;
  readonly isReleasingEnvelope: boolean;
  readonly selectedEnvelopeId: string | null;

  constructor(
    public member: Member,
    isDeleting: boolean,
    availableEnvelopes: Envelope[] | null,
    isAssigningEnvelope: boolean,
    isReleasingEnvelope: boolean,
    selectedEnvelopeId: string | null,
    actions: MemberDetailsSuccessStateActions
  ) {
    super(member, actions);
    this.actions = actions;
    this.isDeleting = isDeleting;
    this.availableEnvelopes = availableEnvelopes;
    this.isAssigningEnvelope = isAssigningEnvelope;
    this.isReleasingEnvelope = isReleasingEnvelope;
    this.selectedEnvelopeId = selectedEnvelopeId;
  }

  // Type guard for safer state checking
  static is(state: any): state is MemberDetailsSuccessState {
    return isSuccessState(state) && "member" in state && "availableEnvelopes" in state;
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

  // Helper methods for envelope status
  hasEnvelope(): boolean {
    return !!this.member.envelopeNumber;
  }

  canAssignEnvelope(): boolean {
    return !this.hasEnvelope() && !!this.availableEnvelopes && this.availableEnvelopes.length > 0;
  }

  canReleaseEnvelope(): boolean {
    return this.hasEnvelope();
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

// Props for the release envelope confirmation modal
interface ReleaseEnvelopeModalProps {
  member: Member;
  envelopeNumber: string;
  onConfirm: () => Promise<void>;
}

/**
 * Release Envelope Modal Component
 * Displays a confirmation dialog for envelope release using NiceModal
 */
export const ReleaseEnvelopeModal = create(({ member, envelopeNumber, onConfirm }: ReleaseEnvelopeModalProps) => {
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
      title="Release Envelope"
      open={modal.visible}
      onOk={handleConfirm}
      onCancel={() => modal.hide()}
      okText="Release"
      cancelText="Cancel"
      okType="primary"
      confirmLoading={isLoading}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '24px', marginTop: '2px' }} />
        <div>
          <p>
            Are you sure you want to release <strong>Envelope #{envelopeNumber}</strong> from{' '}
            <strong>{member.getFullName()}</strong>?
          </p>
          <p>This envelope will become available for assignment to other members.</p>
        </div>
      </div>
    </Modal>
  );
});

/**
 * Custom hook for member details view with envelope assignment functionality
 * Manages the state, data fetching, and actions for the member details page
 */
export const useMemberDetails = () => {
  const { id: memberId } = useParams<{ id: string }>();
  const navigate = useAppNavigation();
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);

  // Combined queries for member data and available envelopes
  const [memberQuery, availableEnvelopesQuery] = useQueries({
    queries: [
      {
        ...MemberQueries.useDetail(memberId ?? ""),
        queryKey: QueryKeys.Members.detail(memberId ?? ""),
      },
      {
        ...EnvelopeQueries.useAvailable(),
        queryKey: QueryKeys.Envelopes.available(),
        // Only fetch if we have a member ID
        enabled: !!memberId,
      }
    ]
  });
  
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

  // Envelope assignment mutation
  const assignEnvelopeMutation = EnvelopeQueries.useAssign({
    onSuccess: () => {
      notifyUtils.success('Envelope successfully assigned');
      setSelectedEnvelopeId(null);
      // Refresh both member and available envelopes data
      memberQuery.refetch();
      availableEnvelopesQuery.refetch();
    },
    onError: (error) => {
      notifyUtils.error('Failed to assign envelope', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  // Envelope release mutation
  const releaseEnvelopeMutation = EnvelopeQueries.useRelease({
    onSuccess: () => {
      notifyUtils.success('Envelope successfully released');
      // Refresh member and available envelopes data
      memberQuery.refetch();
      availableEnvelopesQuery.refetch();
    },
    onError: (error) => {
      notifyUtils.error('Failed to release envelope', error instanceof Error ? error.message : 'Unknown error');
    }
  });

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

  // Handle envelope assignment
  const handleAssignEnvelope = useCallback(async (envelopeId: string) => {
    if (!memberId || !envelopeId) return;
    
    try {
      await assignEnvelopeMutation.mutateAsync({ envelopeId, memberId });
    } catch (error) {
      console.error('Failed to assign envelope:', error);
      throw error;
    }
  }, [memberId, assignEnvelopeMutation]);

  // Handle envelope release
  const handleReleaseEnvelope = useCallback(async () => {
    if (!memberQuery.data?.envelopeNumber) {
      notifyUtils.error('No envelope assigned to this member');
      return;
    }

    // Show confirmation modal first
    NiceModal.show(ReleaseEnvelopeModal, {
      member: memberQuery.data,
      envelopeNumber: memberQuery.data.envelopeNumber,
      onConfirm: async () => {
        try {
          // Use the envelope number to find and release the envelope
          const envelopeNumber = parseInt(memberQuery.data.envelopeNumber!);
          const envelope = await EnvelopeManager.instance.getEnvelopeByNumber(envelopeNumber);
          
          if (envelope) {
            await releaseEnvelopeMutation.mutateAsync(envelope.id);
          } else {
            notifyUtils.error('Could not find envelope to release');
          }
        } catch (error) {
          console.error('Failed to release envelope:', error);
          throw error;
        }
      }
    });
  }, [memberQuery.data, releaseEnvelopeMutation]);

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

  // Handle envelope selection
  const handleSelectEnvelope = useCallback((envelopeId: string | null) => {
    setSelectedEnvelopeId(envelopeId);
  }, []);

  // Map combined queries to our state classes
  return mapQueriesToAsyncState(
    [memberQuery, availableEnvelopesQuery] as const,
    {
      loadingMessage: `Loading member details...`,
      resourceType: "Member",
      resourceId: memberId,
      onSuccess: ([member, availableEnvelopes]) => {
        // Create properly typed actions object
        const actions: MemberDetailsSuccessStateActions = {
          refresh: () => {
            memberQuery.refetch();
            availableEnvelopesQuery.refetch();
          },
          delete: handleDeleteMember,
          print: handlePrint,
          edit: handleEdit,
          goToList: handleGoToList,
          assignEnvelope: handleAssignEnvelope,
          releaseEnvelope: handleReleaseEnvelope,
          selectEnvelope: handleSelectEnvelope,
        };

        return new MemberDetailsSuccessState(
          member,
          deleteMutation.isPending,
          availableEnvelopes || null,
          assignEnvelopeMutation.isPending,
          releaseEnvelopeMutation.isPending,
          selectedEnvelopeId,
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
              retry: () => {
                memberQuery.refetch();
                availableEnvelopesQuery.refetch();
              },
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
              retry: () => {
                memberQuery.refetch();
                availableEnvelopesQuery.refetch();
              }
            }
          });
        }

        // Return null to let the default error handling take over
        return null;
      }
    }
  );
};