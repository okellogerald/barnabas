import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Interest } from "@/models";
import {
    CreateInterestDTO,
    InterestQueryBuilder,
    InterestQueryCriteria,
} from "@/data/interest";
import { InterestManager } from "./interest.manager";

// Create a manager instance
const interestManager = InterestManager.instance;

/**
 * Interest query hooks for data fetching and mutations
 */
export const InterestQueries = {
    /**
     * Hook to fetch a list of interests with optional filtering and pagination
     */
    useList: (
        options?: InterestQueryCriteria | InterestQueryBuilder,
    ): UseQueryResult<{ interests: Interest[]; total: number }, Error> =>
        useQuery({
            queryKey: [
                QueryKeys.Interests.list(),
                InterestQueryBuilder.is(options) ? options.build() : options,
            ],
            queryFn: async () => {
                return await interestManager.getInterests(options);
            },
        }),

    /**
     * Hook to fetch interest count with query criteria or builder
     */
    useCount: (options?: InterestQueryCriteria | InterestQueryBuilder) => {
        const queryKey = [
            QueryKeys.Interests.count(),
            InterestQueryBuilder.is(options) ? options.build() : options,
        ];

        return useQuery({
            queryKey,
            queryFn: () => interestManager.getInterestsCount(options || {}),
        });
    },

    /**
     * Hook to fetch a single interest by ID
     */
    useDetail: (id: string): UseQueryResult<Interest, Error> =>
        useQuery({
            queryKey: QueryKeys.Interests.detail(id),
            queryFn: async () => {
                const interest = await interestManager.getInterestById(id);
                if (!interest) {
                    throw new Error(`Interest with ID ${id} not found`);
                }
                return interest;
            },
            enabled: !!id,
        }),

    /**
     * Hook to fetch interests by member ID
     */
    useByMember: (memberId: string): UseQueryResult<Interest[], Error> =>
        useQuery({
            queryKey: QueryKeys.Interests.byMember(memberId),
            queryFn: async () => {
                return await interestManager.getInterestsByMemberId(memberId);
            },
            enabled: !!memberId,
        }),

    /**
     * Hook to fetch interests by opportunity ID
     */
    useByOpportunity: (
        opportunityId: string,
    ): UseQueryResult<Interest[], Error> =>
        useQuery({
            queryKey: QueryKeys.Interests.byOpportunity(opportunityId),
            queryFn: async () => {
                return await interestManager.getInterestsByOpportunityId(
                    opportunityId,
                );
            },
            enabled: !!opportunityId,
        }),

    /**
     * Hook for creating a new interest
     */
    useCreate: (): UseMutationResult<
        Interest,
        Error,
        CreateInterestDTO,
        unknown
    > => useMutation({
        mutationFn: async (data: CreateInterestDTO) => {
            return await interestManager.createInterest(data);
        },
        onSuccess: (createdInterest) => {
            // Invalidate relevant queries
            Query.Interests.invalidateList();
            Query.Interests.invalidateCount();

            // Invalidate member and opportunity related queries
            Query.Interests.invalidateByMember(createdInterest.memberId);
            Query.Interests.invalidateByOpportunity(
                createdInterest.opportunityId,
            );

            // Also invalidate member and opportunity details
            Query.Members.invalidateDetail(createdInterest.memberId);
            Query.VolunteerOpportunities.invalidateDetail(
                createdInterest.opportunityId,
            );
        },
    }),

    /**
     * Hook for deleting an interest
     */
    useDelete: (): UseMutationResult<
        Interest,
        Error,
        string,
        { previousInterest: Interest | null }
    > => useMutation({
        mutationFn: async (interestId: string) => {
            return await interestManager.deleteInterest(interestId);
        },
        // Use onMutate for optimistic updates
        onMutate: async (interestId: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: QueryKeys.Interests.detail(interestId),
            });

            // Snapshot the previous interest
            const previousInterest = queryClient.getQueryData<Interest>(
                QueryKeys.Interests.detail(interestId),
            );

            return { previousInterest: previousInterest || null };
        },
        onSuccess: (deletedInterest) => {
            // Remove from cache
            Query.Interests.removeDetail(deletedInterest.id);

            // Invalidate lists and related queries
            Query.Interests.invalidateList();
            Query.Interests.invalidateCount();
            Query.Interests.invalidateByMember(deletedInterest.memberId);
            Query.Interests.invalidateByOpportunity(
                deletedInterest.opportunityId,
            );

            // Also invalidate member and opportunity details
            Query.Members.invalidateDetail(deletedInterest.memberId);
            Query.VolunteerOpportunities.invalidateDetail(
                deletedInterest.opportunityId,
            );
        },
        onError: (_, __, context) => {
            // If there was an error, restore from snapshot
            if (context?.previousInterest) {
                queryClient.setQueryData(
                    QueryKeys.Interests.detail(context.previousInterest.id),
                    context.previousInterest,
                );
            }
        },
    }),
};
