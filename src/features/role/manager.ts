import { RoleQueryParams, RoleRepository } from "@/data/role";
import { RoleActionRepository } from "@/data/role-actions";
import { PermissionError } from "@/lib/error";
import { Actions, PermissionsManager } from "@/features/auth/permission";
import { Role, RoleAction } from "@/models";

/**
 * @typedef {object} GetRolesResponse
 * @property {Role[]} roles - An array of role objects.
 * @property {number} total - The total number of roles matching the query (regardless of pagination).
 */
type GetRolesResponse = {
    roles: Role[];
    total: number;
};

/**
 * Role Manager
 *
 * Handles role-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using PermissionsManager.
 *
 * Roles are pre-defined and cannot be created, updated, or deleted.
 *
 * Implemented as a singleton.
 */
export class RoleManager {
    private static _instance: RoleManager;
    private _repo: RoleRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     * Initializes the manager with necessary dependencies.
     * @param {RoleRepository} repo - The RoleRepository instance for data access.
     * @param {PermissionsManager} permissionsManager - The PermissionsManager instance for permission checks.
     */
    private constructor(
        repo: RoleRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permissionsManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of RoleManager.
     * Creates the instance if it doesn't exist yet.
     * @returns {RoleManager} The singleton RoleManager instance.
     */
    public static get instance(): RoleManager {
        if (!RoleManager._instance) {
            RoleManager._instance = new RoleManager(
                new RoleRepository(),
                PermissionsManager.getInstance(),
            );
        }
        return RoleManager._instance;
    }

    /**
     * Retrieves the total count of roles matching the optional query parameters,
     * enforcing the ROLE_FIND_ALL permission.
     *
     * @param {RoleQueryParams} [queryParams] - Optional parameters for filtering the count.
     * @returns {Promise<number>} A promise that resolves to the total number of roles matching the query.
     * @throws {PermissionError} If the user does not have the ROLE_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving the count from the repository.
     */
    public async getRolesCount(
        queryParams?: RoleQueryParams,
    ): Promise<number> {
        // Check if the user has permission to find roles
        if (!this._permissionsManager.canPerformAction(Actions.ROLE_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.ROLE_FIND_ALL);
        }

        try {
            // Merge incoming queryParams with a minimal range
            const updatedQueryParams: RoleQueryParams = {
                ...queryParams,
                rangeStart: 0,
                rangeEnd: 1,
            };

            // Call the repository with the combined parameters
            const response = await this._repo.getAll(updatedQueryParams);

            // Return the total count
            return response.total;
        } catch (error) {
            console.error("Error retrieving filtered roles count:", error);
            throw new Error("Failed to retrieve roles count.");
        }
    }

    /**
     * Retrieves a list of roles, potentially filtered and paginated,
     * enforcing the ROLE_FIND_ALL permission.
     *
     * @param {RoleQueryParams} [queryParams] - Optional parameters for filtering, sorting, and pagination.
     * @returns {Promise<GetRolesResponse>} A promise that resolves to an object containing the list of roles
     * for the requested page/filter and the total count of roles matching the query.
     * @throws {PermissionError} If the user does not have the ROLE_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving roles from the repository.
     */
    public async getRoles(
        queryParams?: RoleQueryParams,
    ): Promise<GetRolesResponse> {
        if (!this._permissionsManager.canPerformAction(Actions.ROLE_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.ROLE_FIND_ALL);
        }

        try {
            // Delegate fetching to the repository
            const response = await this._repo.getAll(queryParams);

            // Convert DTOs returned by the repo into Role model instances
            const roles = response.results.map(Role.fromDTO);

            // Return the roles for the current page and the total count
            return { roles, total: response.total };
        } catch (error) {
            console.error("Error retrieving roles:", error);
            throw new Error("Failed to retrieve roles.");
        }
    }

    /**
     * Retrieves a single role by its ID, enforcing the ROLE_FIND_BY_ID permission.
     *
     * @param {string} roleId - The unique identifier of the role to retrieve.
     * @returns {Promise<Role | undefined>} A promise that resolves to the Role object if found, otherwise undefined.
     * @throws {PermissionError} If the user does not have the ROLE_FIND_BY_ID permission.
     * @throws {Error} If there is an error retrieving the role from the repository.
     */
    public async getRoleById(roleId: string): Promise<Role | undefined> {
        if (
            !this._permissionsManager.canPerformAction(Actions.ROLE_FIND_BY_ID)
        ) {
            throw PermissionError.fromAction(Actions.ROLE_FIND_BY_ID);
        }

        try {
            // Fetch the role DTO by ID from the repository
            const dto = await this._repo.getById(roleId);

            // If found, convert DTO to Role model instance, otherwise return undefined
            return dto ? Role.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving role by ID (${roleId}):`,
                error,
            );
            throw new Error("Failed to retrieve role by ID.");
        }
    }

    /**
     * Gets the actions assigned to a specific role
     *
     * @param {string} roleId - The unique identifier of the role
     * @returns {Promise<string[]>} A promise that resolves to an array of action codes
     * @throws {PermissionError} If the user does not have the ROLE_FIND_ACTIONS permission
     */
    public async getRoleActions(roleId: string): Promise<RoleAction[]> {
        if (
            !this._permissionsManager.canPerformAction(Actions.ROLE_FIND_ALL)
        ) {
            throw PermissionError.fromAction(Actions.ROLE_FIND_ALL);
        }

        try {
            const actionsRepo = new RoleActionRepository({ roleId });
            const result = await actionsRepo.getAll();
            const actions = result.results.map(RoleAction.fromDTO);
            return actions;
        } catch (error) {
            console.error(
                `Error retrieving actions for role (${roleId}):`,
                error,
            );
            throw new Error("Failed to retrieve role actions.");
        }
    }
}
