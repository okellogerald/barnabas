import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../_queries';
import { MemberDetailsService } from './service';
import { determineQueryState } from '../_new_state/query_matcher';
import { AsyncState, AsyncStateFactory } from '../_new_state/types';
import { Navigation, useAppNavigation } from '@/app';
import { Member } from '@/models';
import { MemberDetailsSuccessState } from './types';
import { useParams } from 'react-router-dom';
import { notifyUtils } from '@/utilities/notification.utils';
import NiceModal from '@ebay/nice-modal-react';
import DeleteMemberModal from '@/components/member/modal_delete_confirm';

/**
 * Custom hook for managing member details
 */
export const useMemberDetails = (): AsyncState => {
  const { id: memberId } = useParams<{ id: string }>();
  
  const loadMemberQuery = useQuery({
    queryKey: [QueryKeys.members.detail, memberId],
    queryFn: () => MemberDetailsService.loadMember(memberId),
  });
  
  const deleteMemberMutation = useMutation({
    mutationKey: ["delete-member", memberId],
    mutationFn: () => MemberDetailsService.deleteMember(memberId),
    onSuccess: () => {
      notifyUtils.success('Member successfully deleted');
      Navigation.Members.toList();
    },
    onError: (error) => {
      notifyUtils.error('Failed to delete member', error instanceof Error ? error.message : 'Unknown error');
    }
  });
  
  // Load member data when memberId changes or on initial render
  useEffect(() => {
    if (memberId) { loadMemberQuery.refetch(); }
    if (!memberId) useAppNavigation().Members.toList();
  }, [memberId]);
  
  const refetchMember = async () => {
    await loadMemberQuery.refetch();
  };

  // Handle showing delete confirmation
  const handleStartDelete = (member: Member) => {
    NiceModal.show(DeleteMemberModal, {
      memberName: `${member.firstName} ${member.lastName}`,
      onConfirm: async () => {
        await deleteMemberMutation.mutateAsync();
      }
    }).catch(() => {
      // User cancelled - do nothing
    });
  };
  
  // Use the state determination utility
  return determineQueryState<Member | undefined>({
    queryResult: loadMemberQuery,
    loadingMessage: `Loading entity ${memberId}...`,
    onAuthorizationError: () =>
      AsyncStateFactory.unauthorized({
        message: 'You do not have permission to view member details',
        actions: {
          goBack: () => useAppNavigation().goBack(),
          login: () => useAppNavigation().toLogin(),
          retry: () => refetchMember(),
        }
      }),
    onCustomSuccess: function (data) {
      if (!data) {
        return AsyncStateFactory.notFound({
          message: `Member with ID ${memberId} not found`,
          resourceType: "Member",
          resourceId: memberId,
          actions: {
            goBack: () => useAppNavigation().goBack(),
            retry: () => refetchMember(),
            goToList: () => useAppNavigation().Members.toList(),
          }
        });
      }
      
      const member = data;
      return new MemberDetailsSuccessState(member, {
        startDelete: () => {
          handleStartDelete(member);
        },
        startRefresh: () => refetchMember(),
        startPrint: () => {
          notifyUtils.info('Printing functionality to be implemented');
        },
        goToEdit: () => {
          Navigation.Members.toEdit(member.id);
        },
        goToList: () => {
          Navigation.Members.toList();
        }
      });
    }
  });
};