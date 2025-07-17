import { BaseRepository } from "@/data/shared";
import { interestContract } from "./interest.api-contract";
import { CreateInterestDTO, InterestDTO } from "./interest.schema";
import { InterestQueryBuilder } from "./interest.query-builder";

/**
 * Repository for managing volunteer interest data
 */
export class InterestRepository extends BaseRepository<typeof interestContract> {
  constructor() {
    super("interest", interestContract);
  }

  /**
   * Default query parameters
   */
  static defaultQueryParams = {
    eager: "[member,opportunity]",
  };

  /**
   * Get all volunteer interests with pagination and filtering
   */
  async getAll(queryBuilder: InterestQueryBuilder): Promise<InterestDTO[]> {
    const result = await this.client.getAll({
      query: queryBuilder.build(),
    });
    return this.handleResponse<InterestDTO[]>(result, 200);
  }

  /**
   * Get all volunteer interests with pagination and filtering
   */
  async getPaginated(queryBuilder: InterestQueryBuilder): Promise<{ results: InterestDTO[]; total: number }> {
    const result = await this.client.getPaginated({
      query: queryBuilder.build(),
    });
    return this.handleResponse<{ results: InterestDTO[]; total: number }>(result, 200);
  }

  /**
   * Get volunteer interest by ID
   */
  async getById(id: string): Promise<InterestDTO | null> {
    const result = await this.client.getById({ params: { id } });

    if (result.status === 404) {
      return null;
    }

    return this.handleResponse<InterestDTO>(result, 200);
  }

  /**
   * Get volunteer interests by member ID
   */
  async getByMemberId(memberId: string): Promise<InterestDTO[]> {
    const result = await this.client.getByMemberId({
      params: { memberId },
    });
    return this.handleResponse<InterestDTO[]>(result, 200);
  }

  /**
   * Get volunteer interests by opportunity ID
   */
  async getByOpportunityId(opportunityId: string): Promise<InterestDTO[]> {
    const result = await this.client.getByOpportunityId({
      params: { opportunityId },
    });
    return this.handleResponse<InterestDTO[]>(result, 200);
  }

  /**
   * Create a volunteer interest
   */
  async create(data: CreateInterestDTO): Promise<InterestDTO> {
    const result = await this.client.create({ body: data });
    return this.handleResponse<InterestDTO>(result, 201);
  }

  /**
   * Delete a volunteer interest
   */
  async delete(id: string): Promise<InterestDTO> {
    const result = await this.client.delete({ params: { id } });
    return this.handleResponse<InterestDTO>(result, 200);
  }
}
