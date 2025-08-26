import { useQuery } from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query";
import { ReportManager } from "./report.manager";
import { FellowshipManager } from "@/data/fellowship";
import { EnvelopeManager } from "@/data/envelope";

// Create manager instances
const reportManager = ReportManager.instance;
const fellowshipManager = FellowshipManager.instance;
const envelopeManager = EnvelopeManager.instance;

/**
 * Report query hooks for data fetching
 * Uses new report endpoints for member data and existing managers for fellowship/envelope data
 */
export const ReportQueries = {
  /**
   * Hook to fetch total active members count (uses new report endpoint)
   */
  useMemberCount: (startDate?: string, endDate?: string): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: ["reports", "members", "count", { startDate, endDate }],
      queryFn: async () => {
        return await reportManager.getMemberCount(startDate, endDate);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook to fetch member count by gender (uses new report endpoint)
   */
  useMemberCountByGender: (
    startDate?: string,
    endDate?: string
  ): UseQueryResult<{ male: number; female: number }, Error> =>
    useQuery({
      queryKey: ["reports", "members", "count-by-gender", { startDate, endDate }],
      queryFn: async () => {
        return await reportManager.getMemberCountByGender(startDate, endDate);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook to fetch fellowship count (uses existing FellowshipManager)
   */
  useFellowshipCount: (): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: ["reports", "fellowships", "count"],
      queryFn: async () => {
        return await fellowshipManager.getFellowshipsCount();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook to fetch available envelope count (uses existing EnvelopeManager)
   */
  useAvailableEnvelopeCount: (): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: ["reports", "envelopes", "available-count"],
      queryFn: async () => {
        const availableEnvelopes = await envelopeManager.getAvailableEnvelopes();
        return availableEnvelopes.length;
      },
      staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for envelopes)
    }),

  /**
   * Hook to fetch all dashboard statistics (combines all sources)
   */
  useDashboardStats: (): UseQueryResult<
    {
      totalActiveMembers: number;
      totalMaleMembers: number;
      totalFemaleMembers: number;
      totalActiveMembersLast6Months: number;
      totalActiveFellowships: number;
      availableEnvelopes: number;
    },
    Error
  > =>
    useQuery({
      queryKey: ["reports", "dashboard", "stats"],
      queryFn: async () => {
        return await reportManager.getDashboardStats();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook to fetch member count for last 6 months (uses new report endpoint)
   */
  useMemberCountLast6Months: (): UseQueryResult<number, Error> => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    return useQuery({
      queryKey: ["reports", "members", "count", "last-6-months", startDate],
      queryFn: async () => {
        return await reportManager.getMemberCount(startDate);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};
