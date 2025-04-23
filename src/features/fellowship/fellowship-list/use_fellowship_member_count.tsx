import { useState, useEffect } from 'react';
import { MemberManager } from '@/managers/member';

/**
 * Custom hook to fetch member counts for a list of fellowships
 * This is a temporary solution until the API provides the member count directly
 * 
 * @param fellowshipIds - Array of fellowship IDs to fetch counts for
 * @returns Object with counts mapped by fellowship ID, loading state, and any error
 */
export const useFellowshipMemberCounts = (fellowshipIds: string[]) => {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Skip if no fellowship IDs
        if (!fellowshipIds.length) return;

        const fetchCounts = async () => {
            setLoading(true);
            try {
                const memberManager = MemberManager.instance;
                const countsMap: Record<string, number> = {};

                // Process in batches to avoid too many concurrent requests
                // Process 5 fellowships at a time
                const batchSize = 5;
                for (let i = 0; i < fellowshipIds.length; i += batchSize) {
                    const batch = fellowshipIds.slice(i, i + batchSize);

                    // Create an array of promises for the current batch
                    const batchPromises = batch.map(async (id) => {
                        try {
                            const count = await memberManager.getMembersCount({ fellowshipId: id });
                            return { id, count };
                        } catch (err) {
                            console.error(`Error fetching count for fellowship ${id}:`, err);
                            return { id, count: 0 }; // Default to 0 if there's an error
                        }
                    });

                    // Wait for all promises in this batch to settle
                    const results = await Promise.all(batchPromises);

                    // Add results to the counts map
                    results.forEach(({ id, count }) => {
                        countsMap[id] = count;
                    });
                }

                setCounts(countsMap);
                setError(null);
            } catch (err) {
                console.error("Error fetching fellowship member counts:", err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, [fellowshipIds.join(',')]);

    return { counts, loading, error };
};