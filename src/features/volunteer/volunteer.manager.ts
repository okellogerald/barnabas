import {
    CreateOpportunityDTO,
    UpdateOpportunityDTO,
    VolunteerQueryBuilder,
    VolunteerQueryCriteria,
    VolunteerRepository,
} from "@/data/volunteer";
import { VolunteerOpportunity } from "@/models";
import { Actions, PermissionsManager } from "@/features/auth/permission";
import { PermissionError } from "@/lib/error";

/**
 * @typedef {object} GetOpportunitiesResponse
 * @property {VolunteerOpportunity[]} opportunities - An array of volunteer opportunity objects.
 * @property {number} total - The total number of opportunities matching the query.
 */
export type GetOpportunitiesResponse = {
    opportunities: VolunteerOpportunity[];
    total: number;
};

/**
 * Volunteer Opportunity Manager
 *
 * Handles volunteer opportunity-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using PermissionsManager.
 * Implemented as a singleton.
 */
export class VolunteerManager {
    private static _instance: VolunteerManager;
    private _repo: VolunteerRepository;
    private _permManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor(
        repo: VolunteerRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of VolunteerManager.
     */
    public static get instance(): VolunteerManager {
        if (!VolunteerManager._instance) {
            VolunteerManager._instance = new VolunteerManager(
                new VolunteerRepository(),
                PermissionsManager.getInstance(),
            );
        }
        return VolunteerManager._instance;
    }

    /**
     * Retrieves a filtered count of volunteer opportunities
     */
    public async getOpportunitiesCount(
        options: VolunteerQueryCriteria | VolunteerQueryBuilder = {},
    ): Promise<number> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_FIND_ALL);
        }

        try {
            const builder = VolunteerQueryBuilder.from(options)
                .configureForCount();
            const response = await this._repo.getCount(builder);
            return response;
        } catch (error) {
            console.error("Error retrieving volunteer opportunities count:", error);
            throw new Error("Failed to retrieve volunteer opportunities count.");
        }
    }

    /**
     * Retrieves all volunteer opportunities with optional filtering and pagination.
     */
    public async getOpportunities(
        options?: VolunteerQueryCriteria | VolunteerQueryBuilder,
    ): Promise<GetOpportunitiesResponse> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_FIND_ALL);
        }

        try {
            const builder = VolunteerQueryBuilder.from(options);
            const response = await this._repo.getAll(builder);

            const opportunities = response.results.map(VolunteerOpportunity.fromDTO);
            return { opportunities, total: response.total };
        } catch (error) {
            console.error("Error retrieving volunteer opportunities:", error);
            throw new Error("Failed to retrieve volunteer opportunities.");
        }
    }

    /**
     * Retrieves a volunteer opportunity by ID.
     */
    public async getOpportunityById(
        opportunityId: string,
    ): Promise<VolunteerOpportunity | undefined> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_FIND_BY_ID)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_FIND_BY_ID);
        }

        try {
            const dto = await this._repo.getById(opportunityId);
            return dto ? VolunteerOpportunity.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving volunteer opportunity by ID (${opportunityId}):`,
                error,
            );
            throw new Error("Failed to retrieve volunteer opportunity by ID.");
        }
    }

    /**
     * Creates a new volunteer opportunity.
     */
    public async createOpportunity(
        data: CreateOpportunityDTO,
    ): Promise<VolunteerOpportunity> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_CREATE)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_CREATE);
        }

        try {
            const dto = await this._repo.create(data);
            return VolunteerOpportunity.fromDTO(dto);
        } catch (error) {
            console.error("Error creating volunteer opportunity:", error);
            throw new Error("Failed to create volunteer opportunity.");
        }
    }

    /**
     * Updates an existing volunteer opportunity.
     */
    public async updateOpportunity(
        opportunityId: string,
        data: UpdateOpportunityDTO,
    ): Promise<VolunteerOpportunity> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_UPDATE)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_UPDATE);
        }

        try {
            const dto = await this._repo.update(opportunityId, data);
            return VolunteerOpportunity.fromDTO(dto);
        } catch (error) {
            console.error(
                `Error updating volunteer opportunity (${opportunityId}):`,
                error,
            );
            throw new Error("Failed to update volunteer opportunity.");
        }
    }

    /**
     * Deletes a volunteer opportunity.
     */
    public async deleteOpportunity(opportunityId: string): Promise<VolunteerOpportunity> {
        if (!this._permManager.canPerformAction(Actions.OPPORTUNITY_DELETE_BY_ID)) {
            throw PermissionError.fromAction(Actions.OPPORTUNITY_DELETE_BY_ID);
        }

        try {
            const dto = await this._repo.delete(opportunityId);
            return VolunteerOpportunity.fromDTO(dto);
        } catch (error) {
            console.error(
                `Error deleting volunteer opportunity (${opportunityId}):`,
                error,
            );
            throw new Error("Failed to delete volunteer opportunity.");
        }
    }
}