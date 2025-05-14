import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { VolunteerOpportunity } from "@/models";
import {
  CreateVolunteerOpportunityDTO,
  UpdateVolunteerOpportunityDTO,
  VolunteerOpportunityQueryBuilder,
  VolunteerOpportunityQueryCriteria,
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
    options?:
      | VolunteerOpportunityQueryCriteria
      | VolunteerOpportunityQueryBuilder,
  ): UseQueryResult<
    { opportunities: VolunteerOpportunity[]; total: number },
    Error
  > =>
    useQuery({
      queryKey: [
        QueryKeys.Volunteers.list(),
        VolunteerOpportunityQueryBuilder.is(options)
          ? options.build()
          : options,
      ],
      queryFn: async () => {
        return await volunteerManager.getPaginatedOpportunities(options);
      },
    }),

  /**
   * Hook to fetch volunteer opportunity count with query criteria or builder
   */
  useCount: (
    options?:
      | VolunteerOpportunityQueryCriteria
      | VolunteerOpportunityQueryBuilder,
  ) => {
    const queryKey = [
      QueryKeys.Volunteers.count(),
      VolunteerOpportunityQueryBuilder.is(options) ? options.build() : options,
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
   * @param {object} props Optional callbacks for success and error states
   * @returns {UseMutationResult<VolunteerOpportunity, Error, CreateVolunteerOpportunityDTO, unknown>} Mutation result
   */
  useCreate: (props?: {
    onSuccess?: (opportunity: VolunteerOpportunity) => void;
    onError?: (error: Error) => void;
  }): UseMutationResult<
    VolunteerOpportunity,
    Error,
    CreateVolunteerOpportunityDTO,
    unknown
  > =>
    useMutation({
      mutationFn: async (data: CreateVolunteerOpportunityDTO) => {
        return await volunteerManager.createOpportunity(data);
      },
      onSuccess: (newOpportunity) => {
        // Invalidate relevant queries
        Query.VolunteerOpportunities.invalidateList();
        Query.VolunteerOpportunities.invalidateCount();

        // Update cache with the new opportunity
        queryClient.setQueryData(
          QueryKeys.Volunteers.opportunityDetail(newOpportunity.id),
          newOpportunity,
        );
        
        // Call the onSuccess callback if provided
        if (props?.onSuccess) {
          props.onSuccess(newOpportunity);
        }
      },
      onError: (error) => {
        // Call the onError callback if provided
        if (props?.onError) {
          props.onError(error);
        }
      }
    }),

  /**
   * Hook for updating an existing volunteer opportunity
   * @param {object} props Optional callbacks for success and error states
   * @returns {UseMutationResult<VolunteerOpportunity, Error, {id: string, data: UpdateVolunteerOpportunityDTO}, unknown>} Mutation result
   */
  useUpdate: (props?: {
    onSuccess?: (opportunity: VolunteerOpportunity) => void;
    onError?: (error: Error) => void;
  }): UseMutationResult<
    VolunteerOpportunity,
    Error,
    { id: string; data: UpdateVolunteerOpportunityDTO },
    unknown
  > =>
    useMutation({
      mutationFn: async (
        { id, data }: { id: string; data: UpdateVolunteerOpportunityDTO },
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
        Query.VolunteerOpportunities.invalidateList();
        Query.VolunteerOpportunities.invalidateCount();
        
        // Call the onSuccess callback if provided
        if (props?.onSuccess) {
          props.onSuccess(updatedOpportunity);
        }
      },
      onError: (error) => {
        // Call the onError callback if provided
        if (props?.onError) {
          props.onError(error);
        }
      }
    }),

  /**
   * Hook for deleting a volunteer opportunity
   * @param {object} props Optional callbacks for success and error states
   * @returns {UseMutationResult<VolunteerOpportunity, Error, string, unknown>} Mutation result
   */
  useDelete: (props?: {
    onSuccess?: (opportunity: VolunteerOpportunity) => void;
    onError?: (error: Error) => void;
  }): UseMutationResult<
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
        Query.VolunteerOpportunities.invalidateList();
        Query.VolunteerOpportunities.invalidateCount();
        
        // Call the onSuccess callback if provided
        if (props?.onSuccess) {
          props.onSuccess(deletedOpportunity);
        }
      },
      onError: (error) => {
        // Call the onError callback if provided
        if (props?.onError) {
          props.onError(error);
        }
      }
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
        const builder = VolunteerOpportunityQueryBuilder.newInstance()
          .filterByName(searchTerm)
          .includeDefaultRelations();

        return await volunteerManager.getPaginatedOpportunities(builder);
      },
      enabled: !!searchTerm && searchTerm.length > 0,
    }),
};