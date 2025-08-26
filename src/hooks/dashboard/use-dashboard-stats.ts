import { useQuery } from "@tanstack/react-query";
import { ReportManager } from "@/data/report/report.manager";
import { FellowshipManager } from "@/data/fellowship/fellowship.manager";
import { EnvelopeManager } from "@/data/envelope/envelope.manager";

// Dashboard stats interface
export interface DashboardStats {
  totalActiveMembers: number;
  totalMaleMembers: number;
  totalFemaleMembers: number;
  totalActiveMembersLast6Months: number;
  totalActiveFellowships: number;
  availableEnvelopes: number;
}

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const reportManager = ReportManager.instance;
      const fellowshipManager = FellowshipManager.instance;
      const envelopeManager = EnvelopeManager.instance;

      const [
        totalActiveMembers,
        genderCounts,
        totalActiveMembersLast6Months,
        totalActiveFellowships,
        availableEnvelopes,
      ] = await Promise.all([
        reportManager.getMemberCount(),
        reportManager.getMemberCountByGender(),
        (() => {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          const startDate = sixMonthsAgo.toISOString().split("T")[0];
          return reportManager.getMemberCount(startDate);
        })(),
        fellowshipManager.getFellowshipsCount(),
        envelopeManager.getAvailableEnvelopes().then((envelopes) => envelopes.length),
      ]);

      return {
        totalActiveMembers,
        totalMaleMembers: genderCounts.male,
        totalFemaleMembers: genderCounts.female,
        totalActiveMembersLast6Months,
        totalActiveFellowships,
        availableEnvelopes,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
