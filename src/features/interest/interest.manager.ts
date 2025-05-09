import {
    CreateInterestDTO,
    InterestQueryBuilder,
    InterestQueryCriteria,
    InterestRepository,
} from "@/data/interest";
import { Interest } from "@/models";
import { Actions, PermissionsManager } from "@/features/auth/permission";
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
 * from the repository and enforcing necessary permissions using PermissionsManager.
 * Implemented as a singleton.
 */
export class InterestManager {
    private static _instance: InterestManager;
    private _repo: InterestRepository;
    private _permManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor(
        repo: InterestRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of InterestManager.
     */
    public static get instance(): InterestManager {
        if (!InterestManager._instance) {
            InterestManager._instance = new InterestManager(
                new InterestRepository(),
                PermissionsManager.getInstance(),
            );
        }
        return InterestManager._instance;
    }

    /**
     * Retrieves a filtered count of volunteer interests
     */
    public async getInterestsCount(
        options: InterestQueryCriteria | InterestQueryBuilder = {},
    ): Promise<number> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const builder = InterestQueryBuilder.from(options)
                .configureForCount();
            const response = await this._repo.getAll(builder);
            return response.total;
        } catch (error) {
            console.error("Error retrieving filtered interests count:", error);
            throw new Error("Failed to retrieve interests count.");
        }
    }

    /**
     * Retrieves all volunteer interests with optional filtering and pagination.
     */
    public async getInterests(
        options?: InterestQueryCriteria | InterestQueryBuilder,
    ): Promise<GetInterestsResponse> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const builder = InterestQueryBuilder.from(options);
            const response = await this._repo.getAll(builder);

            const interests = response.results.map(Interest.fromDTO);
            return { interests, total: response.total };
        } catch (error) {
            console.error("Error retrieving interests:", error);
            throw new Error("Failed to retrieve interests.");
        }
    }

    /**
     * Retrieves a specific volunteer interest by ID.
     */
    public async getInterestById(
        interestId: string,
    ): Promise<Interest | undefined> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const dto = await this._repo.getById(interestId);
            return dto ? Interest.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving interest by ID (${interestId}):`,
                error,
            );
            throw new Error("Failed to retrieve interest by ID.");
        }
    }

    /**
     * Retrieves all volunteer interests for a specific member.
     */
    public async getInterestsByMemberId(
        memberId: string,
    ): Promise<Interest[]> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const dtos = await this._repo.getByMemberId(memberId);
            return dtos.map(Interest.fromDTO);
        } catch (error) {
            console.error(
                `Error retrieving interests for member (${memberId}):`,
                error,
            );
            throw new Error("Failed to retrieve interests for member.");
        }
    }

    /**
     * Retrieves all volunteer interests for a specific opportunity.
     */
    public async getInterestsByOpportunityId(
        opportunityId: string,
    ): Promise<Interest[]> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const dtos = await this._repo.getByOpportunityId(opportunityId);
            return dtos.map(Interest.fromDTO);
        } catch (error) {
            console.error(
                `Error retrieving interests for opportunity (${opportunityId}):`,
                error,
            );
            throw new Error("Failed to retrieve interests for opportunity.");
        }
    }

    /**
     * Creates a new volunteer interest.
     */
    public async createInterest(
        data: CreateInterestDTO,
    ): Promise<Interest> {
        if (!this._permManager.canPerformAction(Actions.INTEREST_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.INTEREST_FIND_ALL);
        }

        try {
            const dto = await this._repo.create(data);
            return Interest.fromDTO(dto);
        } catch (error) {
            console.error("Error creating interest:", error);
            throw new Error("Failed to create interest.");
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
            throw new Error("Failed to delete interest.");
        }
    }
}
