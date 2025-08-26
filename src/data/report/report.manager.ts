import { ReportRepository } from "./report.repository";
import { FellowshipManager } from "@/data/fellowship";
import { EnvelopeManager } from "@/data/envelope";

/**
 * Report Manager
 *
 * Handles report and statistics operations. Uses new report endpoints for member data
 * and existing managers for fellowship and envelope data.
 * Implemented as a singleton.
 */
export class ReportManager {
  private static _instance: ReportManager;
  private _repo: ReportRepository;
  private _fellowshipManager: FellowshipManager;
  private _envelopeManager: EnvelopeManager;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor(repo: ReportRepository, fellowshipManager: FellowshipManager, envelopeManager: EnvelopeManager) {
    this._repo = repo;
    this._fellowshipManager = fellowshipManager;
    this._envelopeManager = envelopeManager;
  }

  /**
   * Gets the singleton instance of ReportManager.
   */
  public static get instance(): ReportManager {
    if (!ReportManager._instance) {
      ReportManager._instance = new ReportManager(
        new ReportRepository(),
        FellowshipManager.instance,
        EnvelopeManager.instance
      );
    }
    return ReportManager._instance;
  }

  /**
   * Get total count of active members (uses new report endpoint)
   */
  public async getMemberCount(startDate?: string, endDate?: string): Promise<number> {
    try {
      const result = await this._repo.getMemberCount(startDate, endDate);
      return result[0]?.["members.count"] || 0;
    } catch (error) {
      console.error("Error retrieving member count:", error);
      throw new Error("Failed to retrieve member count.");
    }
  }

  /**
   * Get member count by gender (uses new report endpoint)
   */
  public async getMemberCountByGender(startDate?: string, endDate?: string): Promise<{ male: number; female: number }> {
    try {
      const result = await this._repo.getMemberCountByGender(startDate, endDate);

      const maleCount = result.find((r) => r["members.gender"] === "Male")?.["members.count"] || 0;
      const femaleCount = result.find((r) => r["members.gender"] === "Female")?.["members.count"] || 0;

      return { male: maleCount, female: femaleCount };
    } catch (error) {
      console.error("Error retrieving member count by gender:", error);
      throw new Error("Failed to retrieve member count by gender.");
    }
  }

  /**
   * Get fellowship count (uses existing FellowshipManager)
   */
  public async getFellowshipCount(): Promise<number> {
    try {
      // Use the existing fellowship manager to get count
      const response = await this._fellowshipManager.getFellowshipsCount();
      return response;
    } catch (error) {
      console.error("Error retrieving fellowship count:", error);
      throw new Error("Failed to retrieve fellowship count.");
    }
  }

  /**
   * Get available envelope count (uses existing EnvelopeManager)
   */
  public async getAvailableEnvelopeCount(): Promise<number> {
    try {
      // Use the existing envelope manager to get available envelopes
      const availableEnvelopes = await this._envelopeManager.getAvailableEnvelopes();
      return availableEnvelopes.length;
    } catch (error) {
      console.error("Error retrieving available envelope count:", error);
      throw new Error("Failed to retrieve available envelope count.");
    }
  }

  /**
   * Get all dashboard statistics
   */
  public async getDashboardStats(): Promise<{
    totalActiveMembers: number;
    totalMaleMembers: number;
    totalFemaleMembers: number;
    totalActiveMembersLast6Months: number;
    totalActiveFellowships: number;
    availableEnvelopes: number;
  }> {
    try {
      // Make individual calls and combine
      const [
        totalActiveMembers,
        genderCounts,
        totalActiveMembersLast6Months,
        totalActiveFellowships,
        availableEnvelopes,
      ] = await Promise.all([
        this.getMemberCount(),
        this.getMemberCountByGender(),
        this.getMemberCountLast6Months(),
        this.getFellowshipCount(),
        this.getAvailableEnvelopeCount(),
      ]);

      return {
        totalActiveMembers,
        totalMaleMembers: genderCounts.male,
        totalFemaleMembers: genderCounts.female,
        totalActiveMembersLast6Months,
        totalActiveFellowships,
        availableEnvelopes,
      };
    } catch (error) {
      console.error("Error retrieving dashboard stats:", error);
      throw new Error("Failed to retrieve dashboard statistics.");
    }
  }

  /**
   * Get member count for the last 6 months (uses new report endpoint)
   */
  private async getMemberCountLast6Months(): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    return this.getMemberCount(startDate);
  }
}
