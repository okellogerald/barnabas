import { useQueries } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query';
import { MemberManager } from '@/data/member';
import { useMemo } from 'react';

/**
 * Custom hook to fetch and cache member counts for a list of fellowships
 * Uses React Query for efficient caching and background refreshing
 * 
 * @param fellowshipIds - Array of fellowship IDs to fetch counts for
 * @returns Object with counts mapped by fellowship ID, loading state, and any error
 */
export const useFellowshipMemberCounts = (fellowshipIds: string[]) => {
    // Filter out any empty/undefined IDs
    const validIds = useMemo(() =>
        (fellowshipIds || []).filter(id => !!id),
        [fellowshipIds]);

    // Create a query for each fellowship ID
    const queries = useQueries({
        queries: validIds.map(id => ({
            // Use a consistent query key structure for proper caching
            queryKey: [...QueryKeys.Members.count(), 'byFellowship', id],
            queryFn: async () => {
                try {
                    const count = await MemberManager.instance.getMembersCount({ fellowshipId: id });
                    return { id, count };
                } catch (err) {
                    console.error(`Error fetching count for fellowship ${id}:`, err);
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