import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { VolunteerOpportunity } from "@/models";
import {
  CreateOpportunityDTO,
  UpdateOpportunityDTO,
  VolunteerQueryBuilder,
  VolunteerQueryCriteria,
} from "@/data/volunteer";
import { VolunteerManager } from "./volunteer.manager";

// Create a manager instance
const volunteerManager = VolunteerManager.instance;

/**
 * Volunteer Opportunity query hooks for data fetching and mutations
 */
export const VolunteerQueries = {
  /**
   * Hook to fetch a list of volunteer opportunities with optional filtering and pagination
   */
  useList: (
    options?: VolunteerQueryCriteria | VolunteerQueryBuilder,
  ): UseQueryResult<{ opportunities: VolunteerOpportunity[]; total: number }, Error> =>
    useQuery({
      queryKey: [
        QueryKeys.Volunteers.list(),
        VolunteerQueryBuilder.is(options) ? options.build() : options,
      ],
      queryFn: async () => {
        return await volunteerManager.getOpportunities(options);
      },
    }),

  /**
   * Hook to fetch volunteer opportunity count with query criteria or builder
   */
  useCount: (options?: VolunteerQueryCriteria | VolunteerQueryBuilder) => {
    const queryKey = [
      QueryKeys.Volunteers.count(),
      VolunteerQueryBuilder.is(options) ? options.build() : options,
    ];

    return useQuery({
      queryKey,
      queryFn: () => volunteerManager.getOpportunitiesCount(options || {}),
    });
  },

  /**
   * Hook to fetch a single volunteer opportunity by ID
   */
  useDetail: (id: string): UseQueryResult<VolunteerOpportunity, Error> =>
    useQuery({
      queryKey: QueryKeys.Volunteers.opportunityDetail(id),
      queryFn: async () => {
        const opportunity = await volunteerManager.getOpportunityById(id);
        if (!opportunity) {
          throw new Error(`Volunteer opportunity with ID ${id} not found`);
        }
        return opportunity;
      },
      enabled: !!id,
    }),

  /**
   * Hook for creating a new volunteer opportunity
   */
  useCreate: (): UseMutationResult<
    VolunteerOpportunity,
    Error,
    CreateOpportunityDTO,
    unknown
  > =>
    useMutation({
      mutationFn: async (data: CreateOpportunityDTO) => {
        return await volunteerManager.createOpportunity(data);
      },
      onSuccess: (newOpportunity) => {
        // Invalidate relevant queries
        Query.Volunteers.invalidateList();
        Query.Volunteers.invalidateCount();

        // Update cache with the new opportunity
        queryClient.setQueryData(
          QueryKeys.Volunteers.opportunityDetail(newOpportunity.id),
          newOpportunity,
        );
      },
    }),

  /**
   * Hook for updating an existing volunteer opportunity
   */
  useUpdate: (): UseMutationResult<
    VolunteerOpportunity,
    Error,
    { id: string; data: UpdateOpportunityDTO },
    unknown
  > =>
    useMutation({
      mutationFn: async (
        { id, data }: { id: string; data: UpdateOpportunityDTO },
      ) => {
        return await volunteerManager.updateOpportunity(id, data);
      },
      onSuccess: (updatedOpportunity) => {
        // Update the detail cache
        queryClient.setQueryData(
          QueryKeys.Volunteers.opportunityDetail(updatedOpportunity.id),
          updatedOpportunity,
        );

        // Invalidate lists
        Query.Volunteers.invalidateList();
        Query.Volunteers.invalidateCount();
      },
    }),

  /**
   * Hook for deleting a volunteer opportunity
   */
  useDelete: (): UseMutationResult<
    VolunteerOpportunity,
    Error,
    string,
    unknown
  > =>
    useMutation({
      mutationFn: async (id: string) => {
        return await volunteerManager.deleteOpportunity(id);
      },
      onSuccess: (deletedOpportunity) => {
        // Remove from cache
        queryClient.removeQueries({
          queryKey: QueryKeys.Volunteers.opportunityDetail(
            deletedOpportunity.id,
          ),
        });

        // Invalidate lists and counts
        Query.Volunteers.invalidateList();
        Query.Volunteers.invalidateCount();
      },
    }),

  /**
   * Hook for searching volunteer opportunities by name
   */
  useSearch: (
    searchTerm: string,
  ): UseQueryResult<
    { opportunities: VolunteerOpportunity[]; total: number },
    Error
  > =>
    useQuery({
      queryKey: [QueryKeys.Volunteers.list(), { search: searchTerm }],
      queryFn: async () => {
        const builder = VolunteerQueryBuilder.newInstance()
          .filterByName(searchTerm)
          .includeDefaultRelations();

        return await volunteerManager.getOpportunities(builder);
      },
      enabled: !!searchTerm && searchTerm.length > 0,
    }),
};
