import { useQueries } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query';
import { useMemo } from 'react';
import { InterestManager } from '@/data/interest';

/**
 * Custom hook to fetch and cache interested member counts for a list of volunteer opportunities
 * Uses React Query for efficient caching and background refreshing
 * 
 * @param opportunityIds - Array of opportunity IDs to fetch counts for
 * @returns Object with counts mapped by opportunity ID, loading state, and any error
 */
export const useOpportunityMemberCounts = (opportunityIds: string[]) => {
    // Filter out any empty/undefined IDs
    const validIds = useMemo(() =>
        (opportunityIds || []).filter(id => !!id),
        [opportunityIds]);

    // Create a query for each opportunity ID
    const queries = useQueries({
        queries: validIds.map(id => ({
            // Use a consistent query key structure for proper caching
            queryKey: [...QueryKeys.Interests.count(), 'byOpportunity', id],
            queryFn: async () => {
                try {
                    // Get all interests for this opportunity
                    const interests = await InterestManager.instance.getInterestsByOpportunityId(id);
                    return { id, count: interests.length };
                } catch (err) {
                    console.error(`Error fetching count for opportunity ${id}:`, err);
                    // Return 0 instead of throwing to avoid breaking the entire list
                    return { id, count: 0 };
                }
            },
            // Enable caching for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep cached data for 10 minutes when unused
            gcTime: 10 * 60 * 1000,
            // Retry failed queries up to 3 times
            retry: 3,
            // Don't refetch on window focus for this data
            refetchOnWindowFocus: false
        }))
    });

    // Extract counts from query results into a clean object
    const counts = useMemo(() =>
        queries.reduce<Record<string, number>>((acc, query) => {
            if (query.data) {
                acc[query.data.id] = query.data.count;
            }
            return acc;
        }, {}),
        [queries]);

    // Determine loading state
    const isLoading = queries.some(query => query.isLoading);

    // Determine if we're refetching data in the background
    const isRefetching = queries.some(query => query.isRefetching);

    // Find first error, if any
    const errorQuery = queries.find(query => query.error);
    const error = errorQuery?.error || null;

    // Return all the needed data and states
    return {
        counts,
        loading: isLoading,
        isRefetching,
        error,
        // Add a refetch function to manually refresh all counts
        refetch: () => {
            queries.forEach(query => query.refetch());
        }
    };
};