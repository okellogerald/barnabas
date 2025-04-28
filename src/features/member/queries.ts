import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Member } from "@/models";
import {
    CreateMemberDTO,
    MemberQueryParams,
    MemberRepository,
    UpdateMemberDTO,
} from "@/data/member";
import { MemberManager } from "@/managers/member";

// Create a repository instance
const memberManager = MemberManager.instance;

/**
 * Member query hooks for data fetching and mutations
 * Provides a central place for all member-related data operations
 */
export const MemberQueries = {
    /**
     * Hook to fetch a list of members with optional filtering and pagination
     * @param {MemberQueryParams} params Optional parameters for filtering and pagination
     * @returns {UseQueryResult<{results: Member[], total: number}, Error>} Query result with members and total
     */
    useList: (
        params?: Record<string, any>,
    ): UseQueryResult<{ results: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [QueryKeys.Members.list(), params],
            queryFn: async () => {
                const _params: MemberQueryParams = {
                    ...params,
                    rangeStart: params?.rangeStart || 0,
                    rangeEnd: params?.rangeEnd || 9,
                    eager: params?.eager ??
                        MemberRepository.defaultQueryParams?.eager,
                };

                console.log("Member query params:", _params);
                const response = await memberManager.getMembers(_params);
                return {
                    results: response.members,
                    total: response.total,
                };
            },
        }),

    /**
     * Hook to get the total count of members with optional filters
     * @param {Partial<MemberQueryParams>} filters Optional filters to apply
     * @returns {UseQueryResult<number, Error>} Query result with the total count
     */
    useCount: (
        filters?: Partial<MemberQueryParams>,
    ): UseQueryResult<number, Error> =>
        useQuery({
            queryKey: [QueryKeys.Members.count(), filters],
            queryFn: async () => {
                return memberManager.getMembersCount(filters);
            },
        }),

    /**
     * Hook to fetch a single member by ID
     * @param {string} id The member ID
     * @returns {UseQueryResult<Member, Error>} Query result with member details
     */
    useDetail: (id: string): UseQueryResult<Member, Error> =>
        useQuery({
            queryKey: QueryKeys.Members.detail(id),
            queryFn: async () => {
                const member = await memberManager.getMemberByID(id);
                if (!member) {
                    throw new Error(`Member with ID ${id} not found`);
                }
                return member;
            },
            enabled: !!id,
        }),

    /**
     * Prefetch a member's details
     * @param {string} id The member ID to prefetch
     * @returns {Promise<void>} Promise that resolves when prefetching is complete
     */
    prefetchDetail: (id: string): Promise<void> =>
        queryClient.prefetchQuery({
            queryKey: QueryKeys.Members.detail(id),
            queryFn: async () => {
                const member = await memberManager.getMemberByID(id);
                return member || null;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),

    /**
     * Hook for creating a new member
     * @returns {UseMutationResult<Member, Error, CreateMemberDTO, unknown>} Mutation result
     */
    useCreate: (): UseMutationResult<Member, Error, CreateMemberDTO, unknown> =>
        useMutation({
            mutationFn: async (data: CreateMemberDTO) => {
                return await memberManager.createMember(data);
            },
            onSuccess: () => {
                // Invalidate relevant queries
                Query.Members.invalidateList();
                Query.Members.invalidateCount();

                // If the new member is assigned to a fellowship, invalidate fellowship queries too
                Query.Fellowships.invalidateList();
            },
        }),

    /**
     * Hook for updating an existing member
     * @returns {UseMutationResult<Member, Error, {id: string, data: UpdateMemberDTO}, unknown>} Mutation result
     */
    useUpdate: (): UseMutationResult<
        Member,
        Error,
        { id: string; data: UpdateMemberDTO },
        unknown
    > => useMutation({
        mutationFn: async (
            { id, data }: { id: string; data: UpdateMemberDTO },
        ) => {
            return await memberManager.updateMember(id, data);
        },
        onSuccess: (updatedMember) => {
            // Update the detail cache
            queryClient.setQueryData(
                QueryKeys.Members.detail(updatedMember.id),
                updatedMember,
            );

            // Invalidate lists
            Query.Members.invalidateList();

            // If fellowship was updated, invalidate fellowship queries
            if ("fellowshipId" in updatedMember) {
                Query.Fellowships.invalidateList();

                // Invalidate membership counts for fellowships
                if (updatedMember.fellowshipId) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            QueryKeys.Fellowships.members(
                                updatedMember.fellowshipId,
                            ),
                        ],
                    });
                }
            }
        },
    }),

    /**
     * Hook for deleting a member
     * @returns {UseMutationResult<void, Error, string, unknown>} Mutation result
     */
    useDelete: (): UseMutationResult<void, Error, string, unknown> =>
        useMutation({
            mutationFn: (id: string) => memberManager.deleteMember(id),
            onSuccess: (_, deletedId) => {
                // Get the member data from cache before removing it
                const memberData = queryClient.getQueryData<Member>(
                    QueryKeys.Members.detail(deletedId),
                );

                // Remove from cache
                queryClient.removeQueries({
                    queryKey: QueryKeys.Members.detail(deletedId),
                });

                // Invalidate lists and counts
                Query.Members.invalidateList();
                Query.Members.invalidateCount();

                // If the member had a fellowship, invalidate fellowship counts
                if (memberData?.fellowshipId) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            QueryKeys.Fellowships.members(
                                memberData.fellowshipId,
                            ),
                        ],
                    });

                    // Invalidate fellowship lists if this member was in leadership
                    Query.Fellowships.invalidateList();
                }
            },
        }),

    /**
     * Hook for removing a dependant from a member
     * @returns {UseMutationResult<Member, Error, {memberId: string, dependantId: string}, unknown>} Mutation result
     */
    useRemoveDependant: (): UseMutationResult<
        Member,
        Error,
        { memberId: string; dependantId: string },
        unknown
    > => useMutation({
        mutationFn: async (
            { memberId, dependantId }: {
                memberId: string;
                dependantId: string;
            },
        ) => {
            // First get the current member
            const member = await memberManager.getMemberByID(memberId);
            if (!member) {
                throw new Error(`Member with ID ${memberId} not found`);
            }

            // Remove the dependant
            const updateData: UpdateMemberDTO = {
                ...member.toUpdateDTO(),
                removeDependantIds: [dependantId],
            };

            // Update the member
            return await memberManager.updateMember(memberId, updateData);
        },
        onSuccess: (updatedMember) => {
            // Update the detail cache
            queryClient.setQueryData(
                QueryKeys.Members.detail(updatedMember.id),
                updatedMember,
            );
        },
    }),

    /**
     * Hook for searching members by name, envelope number, phone, etc.
     * @param {string} searchTerm The search term
     * @returns {UseQueryResult<{results: Member[], total: number}, Error>} Query result with matching members
     */
    useSearch: (
        searchTerm: string,
    ): UseQueryResult<{ results: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [QueryKeys.Members.list(), { search: searchTerm }],
            queryFn: async () => {
                const response = await memberManager.getMembers({
                    search: searchTerm,
                    rangeStart: 0,
                    rangeEnd: 9,
                });

                return {
                    results: response.members,
                    total: response.total,
                };
            },
            enabled: !!searchTerm && searchTerm.length > 0,
        }),

    /**
     * Hook to fetch members by fellowship ID
     * @param {string} fellowshipId The fellowship ID
     * @param {MemberQueryParams} additionalParams Additional query parameters
     * @returns {UseQueryResult<{results: Member[], total: number}, Error>} Query result with members
     */
    useByFellowship: (
        fellowshipId: string,
        additionalParams?: Partial<MemberQueryParams>,
    ): UseQueryResult<{ results: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [
                QueryKeys.Members.list({ fellowshipId }),
                additionalParams,
            ],
            queryFn: async () => {
                const params: MemberQueryParams = {
                    ...additionalParams,
                    fellowshipId,
                    rangeStart: additionalParams?.rangeStart || 0,
                    rangeEnd: additionalParams?.rangeEnd || 9,
                };

                const response = await memberManager.getMembers(params);
                return {
                    results: response.members,
                    total: response.total,
                };
            },
            enabled: !!fellowshipId,
        }),
};
