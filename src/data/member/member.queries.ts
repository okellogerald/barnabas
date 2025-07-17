import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Member } from "@/models";
import { CreateMemberDTO, UpdateMemberDTO } from "@/data/member";
import { MemberManager } from "./member.manager";
import {
    MemberQueryBuilder,
    MemberQueryCriteria,
} from "@/data/member/member.query-builder";

// Create a manager instance
const memberManager = MemberManager.instance;

/**
 * Member query hooks for data fetching and mutations
 * Provides a central place for all member-related data operations
 */
export const MemberQueries = {
    /**
     * Hook to fetch a list of members with optional filtering and pagination
     * @param {MemberQueryCriteria | MemberQueryBuilder} options Optional criteria or builder for filtering and pagination
     * @returns {UseQueryResult<{members: Member[], total: number}, Error>} Query result with members and total
     */
    usePaginatedList: (
        options?: MemberQueryCriteria | MemberQueryBuilder,
    ): UseQueryResult<{ members: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [
                ...QueryKeys.Members.list(),
                MemberQueryBuilder.is(options) ? options.build() : options,
            ],
            queryFn: async () => {
                return await memberManager.getPaginatedMembers(options);
            },
        }),

    /**
     * Hook to fetch a list of members
     * @param {MemberQueryCriteria | MemberQueryBuilder} options Optional criteria or builder for filtering and pagination
     * @returns {UseQueryResult<{members: Member[], total: number}, Error>} Query result with members and total
     */
    useList: (
        options?: MemberQueryCriteria | MemberQueryBuilder,
    ): UseQueryResult<Member[], Error> =>
        useQuery({
            queryKey: [
                ...QueryKeys.Members.list(),
                MemberQueryBuilder.is(options) ? options.build() : options,
            ],
            queryFn: async () => {
                return await memberManager.getMembers(options);
            },
        }),

    /**
     * Hook to get the total count of members with optional filters
     * @param options Optional criteria or builder for filtering
     * @returns {UseQueryResult<number, Error>} Query result with the total count
     */
    useCount: (
        options?: Parameters<typeof memberManager.getMembersCount>[0],
    ): UseQueryResult<number, Error> =>
        useQuery({
            queryKey: [
                ...QueryKeys.Members.count(),
                MemberQueryBuilder.is(options) ? options.build() : options,
            ],
            queryFn: async () => {
                return memberManager.getMembersCount(options);
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
     * @param {object} props Optional callbacks for success and error states
     * @returns {UseMutationResult<Member, Error, CreateMemberDTO, unknown>} Mutation result
     */
    useCreate: (props?: {
        onSuccess?: (member: Member) => void;
        onError?: (error: Error) => void;
    }): UseMutationResult<Member, Error, CreateMemberDTO, unknown> =>
        useMutation({
            mutationFn: async (data: CreateMemberDTO) => {
                return await memberManager.createMember(data);
            },
            onSuccess: (member) => {
                // Invalidate relevant queries
                Query.Members.invalidateList();
                Query.Members.invalidateCount();

                // If the new member is assigned to a fellowship, invalidate fellowship queries too
                Query.Fellowships.invalidateList();

                // Call the onSuccess callback if provided
                if (props?.onSuccess) {
                    props.onSuccess(member);
                }
            },
            onError: (error) => {
                // Call the onError callback if provided
                if (props?.onError) {
                    props.onError(error);
                }
            },
        }),

    /**
     * Hook for updating an existing member
     * @param {object} props Optional callbacks for success and error states
     * @returns {UseMutationResult<Member, Error, {id: string, data: UpdateMemberDTO}, unknown>} Mutation result
     */
    useUpdate: (props?: {
        onSuccess?: (member: Member) => void;
        onError?: (error: Error) => void;
    }): UseMutationResult<
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
                            QueryKeys.Members.count(),
                        ],
                    });
                }
            }

            // Call the onSuccess callback if provided
            if (props?.onSuccess) {
                props.onSuccess(updatedMember);
            }
        },
        onError: (error) => {
            // Call the onError callback if provided
            if (props?.onError) {
                props.onError(error);
            }
        },
    }),

    /**
     * Hook for deleting a member
     * @param {string} id The member ID to delete
     * @param {object} props Optional callbacks for success and error states
     * @returns {UseMutationResult<void, Error, string, unknown>} Mutation result
     */
    useDelete: (id: string, props?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
    }): UseMutationResult<void, Error, string, unknown> =>
        useMutation({
            mutationFn: () => memberManager.deleteMember(id),
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
                            QueryKeys.Members.count(),
                        ],
                    });

                    // Invalidate fellowship lists if this member was in leadership
                    Query.Fellowships.invalidateList();
                }

                if (props?.onSuccess) props?.onSuccess();
            },
            onError: (error) => {
                if (props?.onError) props?.onError(error);
            },
        }),

    /**
     * Hook for removing a dependant from a member
     * @param {object} props Optional callbacks for success and error states
     * @returns {UseMutationResult<Member, Error, {memberId: string, dependantId: string}, unknown>} Mutation result
     */
    useRemoveDependant: (props?: {
        onSuccess?: (member: Member) => void;
        onError?: (error: Error) => void;
    }): UseMutationResult<
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

            // Call the onSuccess callback if provided
            if (props?.onSuccess) {
                props.onSuccess(updatedMember);
            }
        },
        onError: (error) => {
            // Call the onError callback if provided
            if (props?.onError) {
                props.onError(error);
            }
        },
    }),

    /**
     * Hook for searching members by name, envelope number, phone, etc.
     * @param {string} searchTerm The search term
     * @returns {UseQueryResult<{results: Member[], total: number}, Error>} Query result with matching members
     */
    useSearch: (
        searchTerm: string,
    ): UseQueryResult<{ members: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [QueryKeys.Members.list(), { search: searchTerm }],
            queryFn: async () => {
                // Create a builder with search configuration
                const builder = MemberQueryBuilder.newInstance()
                    .includeDefaultRelations()
                    .filterBySearch(searchTerm)
                    .paginate(1, 10);

                return await memberManager.getPaginatedMembers(builder);
            },
            enabled: !!searchTerm && searchTerm.length > 0,
        }),

    /**
     * Hook to fetch members by fellowship ID
     * @param {string} fellowshipId The fellowship ID
     * @param {MemberQueryCriteria} additionalCriteria Additional query criteria
     * @returns {UseQueryResult<{members: Member[], total: number}, Error>} Query result with members
     */
    useByFellowship: (
        fellowshipId: string,
        additionalCriteria?: Omit<MemberQueryCriteria, "fellowshipId">,
    ): UseQueryResult<{ members: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [
                QueryKeys.Members.list(),
                { fellowshipId, ...additionalCriteria },
            ],
            queryFn: async () => {
                // Create combined criteria
                const criteria: MemberQueryCriteria = {
                    ...additionalCriteria,
                    fellowshipId,
                    page: additionalCriteria?.page || 1,
                    pageSize: additionalCriteria?.pageSize || 10,
                };

                // Create a builder and apply the criteria
                const builder = MemberQueryBuilder.createFromCriteria(criteria);

                return await memberManager.getPaginatedMembers(builder);
            },
            enabled: !!fellowshipId,
        }),

    /**
     * Hook to fetch members that match specific filters
     * @param {MemberQueryCriteria} criteria The filter criteria
     * @returns {UseQueryResult<{members: Member[], total: number}, Error>} Query result with filtered members
     */
    useFiltered: (
        criteria: MemberQueryCriteria,
    ): UseQueryResult<{ members: Member[]; total: number }, Error> =>
        useQuery({
            queryKey: [QueryKeys.Members.list(), criteria],
            queryFn: async () => {
                // Create a builder and apply the criteria
                const builder = MemberQueryBuilder.createFromCriteria(criteria);

                return await memberManager.getPaginatedMembers(builder);
            },
            enabled: !!criteria,
        }),
};
