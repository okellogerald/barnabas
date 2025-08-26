import { BaseRepository } from "@/data/shared";
import { reportContract } from "./report.api-contract";
import { MemberCountDTO, MemberCountByGenderDTO } from "./report.schema";

export class ReportRepository extends BaseRepository<typeof reportContract> {
  constructor() {
    super("report", reportContract);
  }

  /**
   * Get total count of active members
   */
  async getMemberCount(startDate?: string, endDate?: string): Promise<MemberCountDTO[]> {
    const query: Record<string, any> = {};
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    const result = await this.client.getMemberCount({ query });
    return this.handleResponse<MemberCountDTO[]>(result, 200);
  }

  /**
   * Get member count by gender
   */
  async getMemberCountByGender(startDate?: string, endDate?: string): Promise<MemberCountByGenderDTO[]> {
    const query: Record<string, any> = {};
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    const result = await this.client.getMemberCountByGender({ query });
    return this.handleResponse<MemberCountByGenderDTO[]>(result, 200);
  }
}
