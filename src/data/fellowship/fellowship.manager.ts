import {
    CreateFellowshipDTO,
    FellowshipQueryParams,
    FellowshipRepository,
    UpdateFellowshipDTO,
} from "@/data/fellowship";
import { Actions, AuthorizationManager } from "@/data/authorization";
import { Fellowship } from "@/models";
import { PermissionError } from "@/lib/error";
import { MemberQueryParams } from "@/data/member";

/**
 * @typedef {object} GetFellowshipsResponse
 * @property {Fellowship[]} fellowships - An array of fellowship objects.
 * @property {number} total - The total number of fellowships matching the query (regardless of pagination).
 */
type GetFellowshipsResponse = {
    fellowships: Fellowship[];
    total: number;
};

/**
 * Fellowship Manager
 *
 * Handles fellowship-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using AuthorizationManager.
 * Implemented as a singleton.
 */
export class FellowshipManager {
    private static _instance: FellowshipManager;
    private _repo: FellowshipRepository;
    private _permissionsManager: AuthorizationManager;

    /**
     * Private constructor to enforce singleton pattern.
     * Initializes the manager with necessary dependencies.
     * @param {FellowshipRepository} repo - The FellowshipRepository instance for data access.
     * @param {AuthorizationManager} permissionsManager - The AuthorizationManager instance for permission checks.
     */
    private constructor(
        repo: FellowshipRepository,
        permissionsManager: AuthorizationManager,
    ) {
        this._repo = repo;
        this._permissionsManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of FellowshipManager.
     * Creates the instance if it doesn't exist yet.
     * @returns {FellowshipManager} The singleton FellowshipManager instance.
     */
    public static get instance(): FellowshipManager {
        if (!FellowshipManager._instance) {
            FellowshipManager._instance = new FellowshipManager(
                new FellowshipRepository(),
                AuthorizationManager.getInstance(),
            );
        }
        return FellowshipManager._instance;
    }

    /**
     * Retrieves the total count of fellowships, enforcing the FELLOWSHIP_FIND_ALL permission.
     *
     * @returns {Promise<number>} A promise that resolves to the total number of fellowships.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving the count from the repository.
     */
    public async getFellowshipsCount(): Promise<number> {
        // Check if the user has permission to find fellowships
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_FIND_ALL,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_ALL);
        }

        try {
            // Fetching a minimal range to get the total count
            const queryParams: FellowshipQueryParams = {
                rangeStart: 0,
                rangeEnd: 1,
            };
            const response = await this._repo.getAll(queryParams);
            return response.total;
        } catch (error) {
            console.error("Error retrieving fellowships count:", error);
            throw new Error("Failed to retrieve fellowships count.");
        }
    }

    /**
     * Retrieves a list of fellowships, potentially filtered and paginated,
     * enforcing the FELLOWSHIP_FIND_ALL permission.
     *
     * @param {FellowshipQueryParams} [queryParams] - Optional parameters for filtering, sorting, and pagination.
     * @returns {Promise<GetFellowshipsResponse>} A promise that resolves to an object containing the list of fellowships
     * for the requested page/filter and the total count of fellowships matching the query.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving fellowships from the repository.
     */
    public async getAll(
        queryParams?: FellowshipQueryParams,
    ): Promise<Fellowship[]> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_FIND_ALL,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_ALL);
        }

        try {
            // Delegate fetching to the repository
            const response = await this._repo.getAll(queryParams);
            // Convert DTOs returned by the repo into Fellowship model instances
            const fellowships = response.results.map(Fellowship.fromDTO);
            // Return the fellowships for the current page and the total count
            return fellowships;
        } catch (error) {
            console.error("Error retrieving fellowships:", error);
            throw new Error("Failed to retrieve fellowships.");
        }
    }

    /**
     * Retrieves a list of fellowships, potentially filtered and paginated,
     * enforcing the FELLOWSHIP_FIND_ALL permission.
     *
     * @param {FellowshipQueryParams} [queryParams] - Optional parameters for filtering, sorting, and pagination.
     * @returns {Promise<GetFellowshipsResponse>} A promise that resolves to an object containing the list of fellowships
     * for the requested page/filter and the total count of fellowships matching the query.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving fellowships from the repository.
     */
    public async getFellowships(
        queryParams?: FellowshipQueryParams,
    ): Promise<GetFellowshipsResponse> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_FIND_ALL,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_ALL);
        }

        try {
            // Delegate fetching to the repository
            const response = await this._repo.getAll(queryParams);
            // Convert DTOs returned by the repo into Fellowship model instances
            const fellowships = response.results.map(Fellowship.fromDTO);
            // Return the fellowships for the current page and the total count
            return { fellowships, total: response.total };
        } catch (error) {
            console.error("Error retrieving fellowships:", error);
            throw new Error("Failed to retrieve fellowships.");
        }
    }

    /**
     * Creates a new fellowship, enforcing the FELLOWSHIP_CREATE permission.
     * After creation, it fetches the complete fellowship data.
     *
     * @param {CreateFellowshipDTO} fellowship - The data transfer object containing the details for the new fellowship.
     * @returns {Promise<Fellowship>} A promise that resolves to the newly created Fellowship object.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_CREATE permission.
     * @throws {Error} If creation fails or the fellowship cannot be found immediately after creation.
     */
    public async createFellowship(
        fellowship: CreateFellowshipDTO,
    ): Promise<Fellowship> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_CREATE,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_CREATE);
        }

        try {
            // Create the fellowship via the repository
            const response = await this._repo.create(fellowship);
            // Fetch the full DTO of the newly created fellowship to ensure we have complete data
            const dto = await this._repo.getById(response.id);
            if (!dto) {
                throw new Error(
                    "Fellowship not found immediately after creation!",
                );
            }
            // Convert DTO to Fellowship model instance
            return Fellowship.fromDTO(dto);
        } catch (error) {
            console.error("Error creating fellowship:", error);
            throw new Error("Failed to create fellowship.");
        }
    }

    /**
     * Retrieves a single fellowship by its ID, enforcing the FELLOWSHIP_FIND_BY_ID permission.
     *
     * @param {string} fellowshipId - The unique identifier of the fellowship to retrieve.
     * @returns {Promise<Fellowship | undefined>} A promise that resolves to the Fellowship object if found, otherwise undefined.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_FIND_BY_ID permission.
     * @throws {Error} If there is an error retrieving the fellowship from the repository.
     */
    public async getFellowshipById(
        fellowshipId: string,
    ): Promise<Fellowship | undefined> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_FIND_BY_ID,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_BY_ID);
        }

        try {
            // Fetch the fellowship DTO by ID from the repository
            const dto = await this._repo.getById(fellowshipId);
            // If found, convert DTO to Fellowship model instance, otherwise return undefined
            return dto ? Fellowship.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving fellowship by ID (${fellowshipId}):`,
                error,
            );
            throw new Error("Failed to retrieve fellowship by ID.");
        }
    }

    /**
     * Updates an existing fellowship's data, enforcing the FELLOWSHIP_UPDATE permission.
     *
     * @param {string} fellowshipId - The unique identifier of the fellowship to update.
     * @param {UpdateFellowshipDTO} data - The data transfer object containing the fields to update.
     * @returns {Promise<Fellowship>} A promise that resolves to the updated Fellowship object.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_UPDATE permission.
     * @throws {Error} If the update fails or the fellowship is not found.
     */
    public async updateFellowship(
        fellowshipId: string,
        data: UpdateFellowshipDTO,
    ): Promise<Fellowship> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_UPDATE,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_UPDATE);
        }

        try {
            // Perform the update via the repository
            const dto = await this._repo.update(fellowshipId, data);
            // Convert the returned (updated) DTO to a Fellowship model instance
            return Fellowship.fromDTO(dto);
        } catch (error) {
            console.error(
                `Error updating fellowship (${fellowshipId}):`,
                error,
            );
            throw new Error("Failed to update fellowship.");
        }
    }

    /**
     * Deletes a fellowship by its ID, enforcing the FELLOWSHIP_DELETE_BY_ID permission.
     *
     * @param {string} fellowshipId - The unique identifier of the fellowship to delete.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     * @throws {PermissionError} If the user does not have the FELLOWSHIP_DELETE_BY_ID permission.
     * @throws {Error} If the deletion fails (e.g., fellowship not found or database error).
     */
    public async deleteFellowship(fellowshipId: string): Promise<void> {
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_DELETE_BY_ID,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_DELETE_BY_ID);
        }

        try {
            // Perform the deletion via the repository
            await this._repo.delete(fellowshipId);
        } catch (error) {
            console.error(
                `Error deleting fellowship (${fellowshipId}):`,
                error,
            );
            throw new Error("Failed to delete fellowship.");
        }
    }

    /**
     * Retrieves fellowships with their member counts.
     * This implementation uses the MemberManager to get the member count for each fellowship.
     *
     * @returns {Promise<GetFellowshipsResponse>} A promise that resolves to an object containing
     * fellowships with member counts and the total number of fellowships.
     * @throws {PermissionError} If the user does not have the required permissions.
     * @throws {Error} If there is an error retrieving the fellowships or member counts.
     */
    public async getFellowshipsWithMemberCount(): Promise<
        GetFellowshipsResponse
    > {
        // Need both fellowship and member permissions for this operation
        if (
            !this._permissionsManager.canPerformAction(
                Actions.FELLOWSHIP_FIND_ALL,
            )
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_ALL);
        }
        if (
            !this._permissionsManager.canPerformAction(Actions.MEMBER_FIND_ALL)
        ) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            // Import here to avoid circular dependencies
            const MemberManager =
                (await import("@/data/member")).MemberManager;
            const manager = MemberManager.instance;

            // Get all fellowships first
            const response = await this._repo.getAll();
            const fellowships = await Promise.all(
                response.results.map(async (dto) => {
                    const fellowship = Fellowship.fromDTO(dto);

                    // Get member count for this fellowship
                    try {
                        const query: MemberQueryParams = {
                            fellowshipId: fellowship.id,
                        };
                        const memberCount = await manager.getMembersCount(
                            query,
                        );
                        // Set the member count on the fellowship object
                        fellowship.memberCount = memberCount;
                    } catch (countError) {
                        console.error(
                            `Error getting member count for fellowship ${fellowship.id}:`,
                            countError,
                        );
                        // If we can't get the count, set it to undefined rather than failing the whole operation
                        fellowship.memberCount = undefined;
                    }

                    return fellowship;
                }),
            );

            return { fellowships, total: response.total };
        } catch (error) {
            console.error(
                "Error retrieving fellowships with member count:",
                error,
            );
            throw new Error(
                "Failed to retrieve fellowships with member count.",
            );
        }
    }
}
