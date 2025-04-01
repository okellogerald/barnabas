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

/**
 * Custom hook for managing member details
 */
export const useMemberDetails = (): AsyncState => {
    const { id: memberId } = useParams<{ id: string }>()

    const loadMemberQuery = useQuery({
        queryKey: [QueryKeys.members.detail, memberId],
        queryFn: () => MemberDetailsService.loadMember(memberId),
    })

    const deleteMemberMutation = useMutation({
        mutationKey: ["delete-member", memberId],
        mutationFn: () => MemberDetailsService.deleteMember(memberId),
        onSuccess: () => {
            Navigation.Members.toList()
        }
    })

    // Load member data when memberId changes or on initial render
    useEffect(() => {
        if (memberId) { loadMemberQuery.refetch() }
        if (!memberId) useAppNavigation().Members.toList()
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

            const member = data!

            return new MemberDetailsSuccessState(member, {
                startDelete: () => {
                    deleteMemberMutation.mutateAsync()
                },
                startRefresh: () => refetchMember(),
                goToEdit: () => {
                    Navigation.Members.toEdit(member.id)
                },
                goToList: () => {
                    Navigation.Members.toList()
                }
            })
        }
    });
};