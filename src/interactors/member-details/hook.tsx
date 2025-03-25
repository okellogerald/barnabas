import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../_queries';
import { MemberDetailsService } from './service';
import { determineQueryState } from '../_new_state/query_matcher';
import { AsyncState, AsyncStateFactory } from '../_new_state/types';
import { useAppNavigation } from '@/app';
import { Member } from '@/models';

/**
 * Custom hook for managing member details
 */
export const useMemberDetails = (memberId?: string): AsyncState => {
    const loadMemberQuery = useQuery({
        queryKey: [QueryKeys.members.detail, memberId],
        queryFn: () => MemberDetailsService.loadMember(memberId),
    })

    const deleteMemberMutation = useMutation({
        mutationKey: ["delete-member", memberId],
        mutationFn: () => MemberDetailsService.deleteMember(memberId)
    })

    // Load member data when memberId changes or on initial render
    useEffect(() => {
        if (memberId) { loadMemberQuery.refetch() }
    }, [memberId]);

    const refetchMember = async () => {
        await loadMemberQuery.refetch()
    }

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
                AsyncStateFactory.notFound({
                    message: `Member with ID ${memberId} not found`,
                    resourceType: "Member",
                    actions: {
                        goBack: () => useAppNavigation().goBack(),
                        retry: () => refetchMember(),
                        goToList: () => useAppNavigation().Members.toList(),
                    }
                });
            }
            return AsyncStateFactory.success(data, {
                refetch: () => refetchMember(),
                delete: () => deleteMemberMutation.mutateAsync()
            });
        }
    });

    // if (loadMemberQuery.data) {
    //     return new MemberDetailsSuccessState(loadMemberQuery.data!, {
    //         loadMember: () => refetchMember(),
    //         deleteMember: () => deleteMemberMutation.mutateAsync()
    //     })
    // }

    // if (loadMemberQuery.error) {
    //     return new MemberDetailsErrorState(loadMemberQuery.error.message, {
    //         retry: refetchMember,
    //     })
    // }

    // // Return loading state with actions if state is not yet initialized
    // return new MemberDetailsLoadingState();
};