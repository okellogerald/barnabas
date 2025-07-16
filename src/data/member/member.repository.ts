import { BaseRepository } from "@/data/shared";
import { memberContract } from "./member.api-contract";
import { CreateMemberDTO, MemberDTO, UpdateMemberDTO } from "./member.schema";
import {
  MemberQueryBuilder,
  MemberQueryCriteria,
} from "./member.query-builder";
import { z } from "zod";

type GetMembersResponse = {
  results: MemberDTO[];
  total: number;
};

export class MemberRepository extends BaseRepository<typeof memberContract> {
  constructor() {
    super("member", memberContract);
  }

  async getCount(
    criteria?: Exclude<
      MemberQueryCriteria,
      "page" | "pageSize" | "sort" | "sortDirection"
    >
  ): Promise<number> {
    try {
      // Convert builder to query params object if it's a builder
      const query = MemberQueryBuilder.from(criteria)
        .configureForCount()
        .build();
      const result = await this.client.getCount({ query });
      if (result.status === 200) {
        const firstItem = result.body[0];
        const validationResult = z
          .object({ "count(*)": z.number() })
          .safeParse(firstItem);
        if (validationResult.success) {
          return validationResult.data["count(*)"];
        }
      }

      throw new Error("Failed to retrieve member count.");
    } catch (error) {
      console.error("Error in getCount:", error);
      throw error;
    }
  }

  /**
   * Get all members with pagination and filtering
   * @param builderOrCriteria - A MemberQueryBuilder or MemberQueryCriteria for filtering data
   * @returns {Promise<GetMembersResponse>} Object containing member data array and total count
   */
  async getPaginated(
    builderOrCriteria?: MemberQueryBuilder | MemberQueryCriteria
  ): Promise<GetMembersResponse> {
    try {
      // Convert builder to query params object if it's a builder
      const query = MemberQueryBuilder.is(builderOrCriteria)
        ? builderOrCriteria.build()
        : builderOrCriteria
        ? builderOrCriteria
        : {};

      // Execute the query
      const result = await this.client.getAll({
        query,
      });

      if (
        result.body &&
        Array.isArray(result.body) &&
        result.body.length === 0
      ) {
        return { results: [], total: 0 };
      }

      return this.handleResponse<GetMembersResponse>(result, 200);
    } catch (error) {
      console.error("Error in getAll:", error);
      throw new Error("Failed to retrieve members.");
    }
  }

  /**
   * Get all members
   * @param builderOrCriteria - A MemberQueryBuilder or MemberQueryCriteria for filtering data
   * @returns {Promise<GetMembersResponse>} Object containing member data array and total count
   */
  async getList(
    builderOrCriteria?: MemberQueryBuilder | MemberQueryCriteria
  ): Promise<MemberDTO[]> {
    try {
      const query = MemberQueryBuilder.from(builderOrCriteria)
        .removeAllRelations()
        .build();

      // Execute the query
      const result = await this.client.getAll({ query });

      if (
        result.body &&
        Array.isArray(result.body) &&
        result.body.length === 0
      ) {
        return [];
      }

      return this.handleResponse<MemberDTO[]>(result, 200);
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }

  /**
   * Get a member by ID
   * @param id - The ID of the member to retrieve
   * @returns {Promise<MemberDTO | null>} The member data or null if not found
   */
  async getById(id: string): Promise<MemberDTO | undefined> {
    try {
      // Create a query builder for fetching a single member by ID
      const builder = MemberQueryBuilder.newInstance()
        .includeDefaultRelations()
        .paginate(1, 1)
        .where("id", id);

      // Get all members matching the criteria
      const result = await this.getPaginated(builder);

      // Find the member with the matching ID
      return result.results.find((m) => m.id === id);

      // TODO: When the API supports direct getById with eager, use this code instead:
      /*
            const query: Record<string, any> = {};

            // Add eager loading if specified
            if (eager) {
                query.eager = eager;
            } else {
                query.eager = MemberRepository.defaultQueryParams.eager;
            }

            const result = await this.client.getById({
                params: { id },
                query,
            });

            if (result.status === 404) {
                return null;
            }

            return this.handleResponse<MemberDTO>(result, 200);
            */
    } catch (error) {
      console.error(`Error retrieving member by ID (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new member
   * @param data - The data for the new member
   * @returns {Promise<MemberDTO>} The created member data
   */
  async create(data: CreateMemberDTO): Promise<MemberDTO> {
    try {
      const result = await this.client.create({
        body: data,
      });
      return this.handleResponse<MemberDTO>(result, 201);
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  }

  /**
   * Update an existing member
   * @param id - The ID of the member to update
   * @param data - The data to update
   * @returns {Promise<MemberDTO>} The updated member data
   */
  async update(id: string, data: UpdateMemberDTO): Promise<MemberDTO> {
    try {
      const result = await this.client.update({
        params: { id },
        body: data,
      });
      return this.handleResponse<MemberDTO>(result, 200);
    } catch (error) {
      console.error(`Error in update with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a member
   * @param id - The ID of the member to delete
   * @returns {Promise<void>} Nothing
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.client.delete({
        params: { id },
      });
      this.handleResponse(result, 200);
    } catch (error) {
      console.error(`Error in delete with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search for members by a search term (name, email, phone, etc.)
   * @param searchTerm - The search term
   * @returns {Promise<GetMembersResponse>} Object containing member data array and total count
   */
  async search(searchTerm: string): Promise<GetMembersResponse> {
    try {
      const builder = MemberQueryBuilder.newInstance()
        .search(searchTerm)
        .includeDefaultRelations();

      return await this.getPaginated(builder);
    } catch (error) {
      console.error(`Error in search with term ${searchTerm}:`, error);
      throw error;
    }
  }

  /**
   * Get members belonging to a specific fellowship
   * @param fellowshipId - The ID of the fellowship
   * @param additionalCriteria - Optional additional filtering criteria
   * @returns {Promise<GetMembersResponse>} Object containing member data array and total count
   */
  async getByFellowship(
    fellowshipId: string,
    additionalCriteria?: Omit<MemberQueryCriteria, "fellowshipId">
  ): Promise<GetMembersResponse> {
    try {
      // Create a builder and set the fellowship filter
      const builder = MemberQueryBuilder.newInstance()
        .filterByFellowshipId(fellowshipId)
        .includeDefaultRelations();

      // Apply additional criteria if provided
      if (additionalCriteria) {
        const criteria: MemberQueryCriteria = {
          ...additionalCriteria,
          fellowshipId,
        };
        builder.applyCriteria(criteria);
      }

      return await this.getPaginated(builder);
    } catch (error) {
      console.error(`Error in getByFellowship with id ${fellowshipId}:`, error);
      throw error;
    }
  }

  /**
   * Get members by baptism status
   * @param isBaptized - The baptism status to filter by
   * @returns {Promise<GetMembersResponse>} Object containing member data array and total count
   */
  async getByBaptismStatus(isBaptized: boolean): Promise<GetMembersResponse> {
    try {
      const builder = MemberQueryBuilder.newInstance()
        .filterByBaptismStatus(isBaptized)
        .includeDefaultRelations();

      return await this.getPaginated(builder);
    } catch (error) {
      console.error(
        `Error in getByBaptismStatus with status ${isBaptized}:`,
        error
      );
      throw error;
    }
  }
}
