import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { Fellowship } from "@/models/fellowship";
import {
  CreateFellowshipDTO,
  FellowshipQueryParams,
  FellowshipRepository,
  UpdateFellowshipDTO
} from "@/data/fellowship";
import { FellowshipManager } from "@/managers/fellowship";

// Create a repository instance
const fellowshipManager = FellowshipManager.instance;

/**
 * Fellowship query hooks for data fetching and mutations
 * Provides a central place for all fellowship-related data operations
 */
export const FellowshipQueries = {
  /**
   * Hook to fetch a list of fellowships with optional filtering and pagination
   * @param {FellowshipQueryParams} params Optional parameters for filtering and pagination
   * @returns {UseQueryResult<{results: Fellowship[], total: number}, Error>} Query result with fellowships and total
   */
  useList: (params?: FellowshipQueryParams): UseQueryResult<{ fellowships: Fellowship[], total: number }, Error> =>
    useQuery({
      queryKey: [QueryKeys.Fellowships.list(), params],
      queryFn: async () => {
        const _params: FellowshipQueryParams = {
          ...params,
          rangeStart: params?.rangeStart || 0,
          rangeEnd: params?.rangeEnd || 9,
          eager: params?.eager ?? FellowshipRepository.defaultQueryParams.eager,
        }
        return await fellowshipManager.getFellowships(_params);
      },
    }),

  /**
   * Hook to get the total count of fellowships with optional filters
   * @param {Partial<FellowshipQueryParams>} filters Optional filters to apply
   * @returns {UseQueryResult<number, Error>} Query result with the total count
   */
  useCount: (filters?: Partial<FellowshipQueryParams>): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: [QueryKeys.Fellowships.count(), filters],
      queryFn: async () => {
        // Get a minimal result (just 1 record) to get the total count
        return fellowshipManager.getFellowshipsCount();
      },
    }),

  /**
   * Hook to fetch a single fellowship by ID
   * @param {string} id The fellowship ID
   * @returns {UseQueryResult<Fellowship, Error>} Query result with fellowship details
   */
  useDetail: (id: string): UseQueryResult<Fellowship, Error> =>
    useQuery({
      queryKey: QueryKeys.Fellowships.detail(id),
      queryFn: async () => {
        const dto = await fellowshipManager.getFellowshipById(id);
        if (!dto) {
          throw new Error(`Fellowship with ID ${id} not found`);
        }
        return Fellowship.fromDTO(dto);
      },
      enabled: !!id,
    }),

  /**
   * Prefetch a fellowship's details
   * @param {string} id The fellowship ID to prefetch
   * @returns {Promise<void>} Promise that resolves when prefetching is complete
   */
  prefetchDetail: (id: string): Promise<void> =>
    queryClient.prefetchQuery({
      queryKey: QueryKeys.Fellowships.detail(id),
      queryFn: async () => {
        const dto = await fellowshipManager.getFellowshipById(id);
        return dto ? Fellowship.fromDTO(dto) : null;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook to fetch members belonging to a specific fellowship
   * @param {string} fellowshipId The fellowship ID
   * @param {object} options Optional parameters like pagination
   * @returns {UseQueryResult<{results: Member[], total: number}, Error>} Query result with members
   */
  useMembersCount: (
    fellowshipId: string,
  ): UseQueryResult<{ results: any[], total: number }, Error> =>
    useQuery({
      queryKey: [QueryKeys.Fellowships.members(fellowshipId)],
      queryFn: async () => {
        // Assuming you have a MemberRepository with similar methods
        const MemberManager = (await import('@/managers/member')).MemberManager;
        const manager = MemberManager.instance;

        const response = await manager.getMembersCount({
          fellowshipId,
        });

        return response
      },
      enabled: !!fellowshipId,
    }),

  /**
   * Hook for creating a new fellowship
   * @returns {UseMutationResult<Fellowship, Error, CreateFellowshipDTO, unknown>} Mutation result
   */
  useCreate: (): UseMutationResult<Fellowship, Error, CreateFellowshipDTO, unknown> =>
    useMutation({
      mutationFn: async (data: CreateFellowshipDTO) => {
        const dto = await fellowshipManager.createFellowship(data);
        return Fellowship.fromDTO(dto);
      },
      onSuccess: () => {
        // Invalidate relevant queries
        Query.Fellowships.invalidateList();
        Query.Fellowships.invalidateCount();
      },
    }),

  /**
   * Hook for updating an existing fellowship
   * @returns {UseMutationResult<Fellowship, Error, {id: string, data: UpdateFellowshipDTO}, unknown>} Mutation result
   */
  useUpdate: (): UseMutationResult<
    Fellowship,
    Error,
    { id: string; data: UpdateFellowshipDTO },
    unknown
  > =>
    useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateFellowshipDTO }) => {
        const dto = await fellowshipManager.updateFellowship(id, data);
        return Fellowship.fromDTO(dto);
      },
      onSuccess: (updatedFellowship) => {
        // Update the detail cache
        queryClient.setQueryData(
          QueryKeys.Fellowships.detail(updatedFellowship.id),
          updatedFellowship
        );

        // Invalidate lists
        Query.Fellowships.invalidateList();

        // If leadership was updated, invalidate leadership queries
        if (
          'chairmanId' in updatedFellowship ||
          'deputyChairmanId' in updatedFellowship ||
          'secretaryId' in updatedFellowship ||
          'treasurerId' in updatedFellowship
        ) {
          Query.Fellowships.invalidateLeadership();
        }
      },
    }),

  /**
   * Hook for deleting a fellowship
   * @returns {UseMutationResult<void, Error, string, unknown>} Mutation result
   */
  useDelete: (): UseMutationResult<void, Error, string, unknown> =>
    useMutation({
      mutationFn: (id: string) => fellowshipManager.deleteFellowship(id),
      onSuccess: (_, deletedId) => {
        // Remove from cache
        Query.Fellowships.removeDetail(deletedId);

        // Invalidate lists and counts
        Query.Fellowships.invalidateList();
        Query.Fellowships.invalidateCount();
        Query.Fellowships.invalidateLeadership();
      },
    }),

  /**
   * Hook for searching fellowships by name or notes
   * @param {string} searchTerm The search term
   * @returns {UseQueryResult<{results: Fellowship[], total: number}, Error>} Query result with matching fellowships
   */
  useSearch: (searchTerm: string): UseQueryResult<{ results: Fellowship[], total: number }, Error> =>
    useQuery({
      queryKey: [QueryKeys.Fellowships.list(), { search: searchTerm }],
      queryFn: async () => {
        // const response = await fellowshipManager.search(searchTerm);
        // return {
        //   results: response.results.map(dto => Fellowship.fromDTO(dto)),
        //   total: response.total
        // };
      },
      enabled: !!searchTerm && searchTerm.length > 0,
    }),
};