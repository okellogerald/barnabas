import { CreateInterestDTO, InterestQueryBuilder, InterestQueryCriteria, InterestRepository } from "@/data/interest";
import { Interest } from "@/models";
import { Actions, AuthorizationManager } from "@/data/authorization";
import { PermissionError } from "@/lib/error";

/**
 * @typedef {object} GetInterestsResponse
 * @property {Interest[]} interests - An array of volunteer interest objects.
 * @property {number} total - The total number of interests matching the query.
 */
type GetInterestsResponse = {
  interests: Interest[];
  total: number;
};

/**
 * Interest Manager
 *
 * Handles volunteer interest operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using AuthorizationManager.
 * Implemented as a singleton.
 */
export class InterestManager {
  private static _instance: InterestManager;
  private _repo: InterestRepository;
  private _permManager: AuthorizationManager;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor(repo: InterestRepository, permissionsManager: AuthorizationManager) {
    this._repo = repo;
    this._permManager = permissionsManager;
  }

  /**
   * Gets the singleton instance of InterestManager.
   */
  public static get instance(): InterestManager {
    if (!InterestManager._instance) {
      InterestManager._instance = new InterestManager(new InterestRepository(), AuthorizationManager.getInstance());
    }
    return InterestManager._instance;
  }

  /**
   * Retrieves a filtered count of volunteer interests
   */
  public async getInterestsCount(options: InterestQueryCriteria | InterestQueryBuilder = {}): Promise<number> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const builder = InterestQueryBuilder.from(options).configureForCount();
      const response = await this._repo.getPaginated(builder);
      return response.total;
    } catch (error) {
      console.error("Error retrieving filtered interests count:", error);
      throw error;
    }
  }

  /**
   * Retrieves all volunteer interests with optional filtering and pagination.
   */
  public async getInterests(options?: InterestQueryCriteria | InterestQueryBuilder): Promise<GetInterestsResponse> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const builder = InterestQueryBuilder.from(options);
      const response = await this._repo.getPaginated(builder);

      const interests = response.results.map(Interest.fromDTO);
      return { interests, total: response.total };
    } catch (error) {
      console.error("Error retrieving interests:", error);
      throw error;
    }
  }

  /**
   * Retrieves a specific volunteer interest by ID.
   */
  public async getInterestById(interestId: string): Promise<Interest | undefined> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const dto = await this._repo.getById(interestId);
      return dto ? Interest.fromDTO(dto) : undefined;
    } catch (error) {
      console.error(`Error retrieving interest by ID (${interestId}):`, error);
      throw error;
    }
  }

  /**
   * Retrieves all volunteer interests for a specific member.
   */
  public async getInterestsByMemberId(memberId: string): Promise<Interest[]> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const dtos = await this._repo.getByMemberId(memberId);
      return dtos.map(Interest.fromDTO);
    } catch (error) {
      console.error(`Error retrieving interests for member (${memberId}):`, error);
      throw error;
    }
  }

  /**
   * Retrieves all volunteer interests for a specific opportunity.
   */
  public async getInterestsByOpportunityId(opportunityId: string): Promise<Interest[]> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const queryBuilder = InterestQueryBuilder.newInstance()
        .includeDefaultRelations()
        .filterByOpportunityId(opportunityId);
      const dtos = await this._repo.getAll(queryBuilder);
      return dtos.map(Interest.fromDTO);
    } catch (error) {
      console.error(`Error retrieving interests for opportunity (${opportunityId}):`, error);
      throw error;
    }
  }

  /**
   * Creates a new volunteer interest.
   */
  public async createInterest(data: CreateInterestDTO): Promise<Interest> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const dto = await this._repo.create(data);
      return Interest.fromDTO(dto);
    } catch (error) {
      console.error("Error creating interest:", error);
      throw error;
    }
  }

  /**
   * Deletes a volunteer interest.
   */
  public async deleteInterest(interestId: string): Promise<Interest> {
    if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
    }

    try {
      const dto = await this._repo.delete(interestId);
      return Interest.fromDTO(dto);
    } catch (error) {
      console.error(`Error deleting interest (${interestId}):`, error);
      throw error;
    }
  }
}
