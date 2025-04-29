import { RoleQueryParams, RoleRepository } from "@/data/role";
import { PermissionError } from "@/lib/error";
import { Actions, PermissionsManager } from "@/managers/auth/permission";
import { Role } from "@/models";

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
                PermissionsManager.instance,
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
        if (!this._permissionsManager.hasPermission(Actions.ROLE_FIND_ALL)) {
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
        if (!this._permissionsManager.hasPermission(Actions.ROLE_FIND_ALL)) {
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

    // /**
    //  * Creates a new role, enforcing the ROLE_CREATE permission.
    //  * After creation, it fetches the complete role data.
    //  *
    //  * @param {CreateRoleDTO} role - The data transfer object containing the details for the new role.
    //  * @returns {Promise<Role>} A promise that resolves to the newly created Role object.
    //  * @throws {PermissionError} If the user does not have the ROLE_CREATE permission.
    //  * @throws {Error} If creation fails or the role cannot be found immediately after creation.
    //  */
    // public async createRole(role: CreateRoleDTO): Promise<Role> {
    //     if (!this._permissionsManager.hasPermission(Actions.ROLE_CREATE)) {
    //         throw PermissionError.fromAction(Actions.ROLE_CREATE);
    //     }

    //     // Create the role via the repository
    //     const response = await this._repo.create(role);

    //     // Fetch the full DTO of the newly created role
    //     const dto = await this._repo.getById(response.id);
    //     if (!dto) {
    //         throw new Error("Role not found immediately after creation!");
    //     }

    //     // Convert DTO to Role model instance
    //     return Role.fromDTO(dto);
    // }

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
            !this._permissionsManager.hasPermission(Actions.ROLE_FIND_BY_ID)
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

    // /**
    //  * Updates an existing role's data, enforcing the ROLE_UPDATE permission.
    //  *
    //  * @param {string} roleId - The unique identifier of the role to update.
    //  * @param {UpdateRoleDTO} data - The data transfer object containing the fields to update.
    //  * @returns {Promise<Role>} A promise that resolves to the updated Role object.
    //  * @throws {PermissionError} If the user does not have the ROLE_UPDATE permission.
    //  * @throws {Error} If the update fails or the role is not found.
    //  */
    // public async updateRole(
    //     roleId: string,
    //     data: UpdateRoleDTO,
    // ): Promise<Role> {
    //     if (
    //         !this._permissionsManager.hasPermission(Actions.ROLE_UPDATE)
    //     ) {
    //         throw PermissionError.fromAction(Actions.ROLE_UPDATE);
    //     }

    //     try {
    //         // Perform the update via the repository
    //         const dto = await this._repo.update(roleId, data);

    //         // Convert the returned (updated) DTO to a Role model instance
    //         return Role.fromDTO(dto);
    //     } catch (error) {
    //         console.error(`Error updating role (${roleId}):`, error);
    //         throw new Error("Failed to update role.");
    //     }
    // }

    // /**
    //  * Deletes a role by its ID, enforcing the ROLE_DELETE permission.
    //  *
    //  * @param {string} roleId - The unique identifier of the role to delete.
    //  * @returns {Promise<void>} A promise that resolves when the deletion is complete.
    //  * @throws {PermissionError} If the user does not have the ROLE_DELETE permission.
    //  * @throws {Error} If the deletion fails (e.g., role not found or database error).
    //  */
    // public async deleteRole(roleId: string): Promise<void> {
    //     if (
    //         !this._permissionsManager.hasPermission(Actions.ROLE_DELETE)
    //     ) {
    //         throw PermissionError.fromAction(Actions.ROLE_DELETE);
    //     }

    //     try {
    //         // Perform the deletion via the repository
    //         await this._repo.delete(roleId);
    //     } catch (error) {
    //         console.error(`Error deleting role (${roleId}):`, error);
    //         throw new Error("Failed to delete role.");
    //     }
    // }

    // /**
    //  * Gets the permissions assigned to a specific role
    //  *
    //  * @param {string} roleId - The unique identifier of the role
    //  * @returns {Promise<string[]>} A promise that resolves to an array of permission codes
    //  * @throws {PermissionError} If the user does not have the ROLE_FIND_PERMISSIONS permission
    //  */
    // public async getRolePermissions(roleId: string): Promise<string[]> {
    //     if (
    //         !this._permissionsManager.hasPermission(Actions.ROLE_FIND_ALL)
    //     ) {
    //         throw PermissionError.fromAction(Actions.ROLE_FIND_ALL);
    //     }

    //     try {
    //         return await this._repo.getPermissions(roleId);
    //     } catch (error) {
    //         console.error(`Error retrieving permissions for role (${roleId}):`, error);
    //         throw new Error("Failed to retrieve role permissions.");
    //     }
    // }

    // /**
    //  * Updates the permissions assigned to a role
    //  *
    //  * @param {string} roleId - The unique identifier of the role
    //  * @param {string[]} permissions - Array of permission codes to assign to the role
    //  * @returns {Promise<string[]>} A promise that resolves to the updated array of permission codes
    //  * @throws {PermissionError} If the user does not have the ROLE_UPDATE_PERMISSIONS permission
    //  */
    // public async updateRolePermissions(
    //     roleId: string,
    //     permissions: string[]
    // ): Promise<string[]> {
    //     if (
    //         !this._permissionsManager.hasPermission(Actions.ROLE_UPDATE_PERMISSIONS)
    //     ) {
    //         throw PermissionError.fromAction(Actions.ROLE_UPDATE_PERMISSIONS);
    //     }

    //     try {
    //         return await this._repo.updatePermissions(roleId, permissions);
    //     } catch (error) {
    //         console.error(`Error updating permissions for role (${roleId}):`, error);
    //         throw new Error("Failed to update role permissions.");
    //     }
    // }
}
