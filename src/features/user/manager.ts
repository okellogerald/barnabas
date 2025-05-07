import {
    CreateUserDTO,
    UpdateUserDTO,
    UserQueryParams,
    UserRepository,
} from "@/data/user";
import { PermissionError } from "@/lib/error";
import { Actions, PermissionsManager } from "@/features/auth/permission";
import { User } from "@/models";

/**
 * @typedef {object} GetUsersResponse
 * @property {User[]} users - An array of user objects.
 * @property {number} total - The total number of users matching the query (regardless of pagination).
 */
type GetUsersResponse = {
    users: User[];
    total: number;
};

/**
 * User Manager
 *
 * Handles user-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using PermissionsManager.
 * Implemented as a singleton.
 */
export class UserManager {
    private static _instance: UserManager;
    private _repo: UserRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     * Initializes the manager with necessary dependencies.
     * @param {UserRepository} repo - The UserRepository instance for data access.
     * @param {PermissionsManager} permissionsManager - The PermissionsManager instance for permission checks.
     */
    private constructor(
        repo: UserRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permissionsManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of UserManager.
     * Creates the instance if it doesn't exist yet.
     * @returns {UserManager} The singleton UserManager instance.
     */
    public static get instance(): UserManager {
        if (!UserManager._instance) {
            UserManager._instance = new UserManager(
                new UserRepository(),
                PermissionsManager.getInstance(),
            );
        }
        return UserManager._instance;
    }

    /**
     * Retrieves the total count of users matching the optional query parameters,
     * enforcing the USER_FIND_ALL permission.
     *
     * @param {UserQueryParams} [queryParams] - Optional parameters for filtering the count.
     * @returns {Promise<number>} A promise that resolves to the total number of users matching the query.
     * @throws {PermissionError} If the user does not have the USER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving the count from the repository.
     */
    public async getUsersCount(
        queryParams?: UserQueryParams,
    ): Promise<number> {
        // Check if the user has permission to find users
        if (!this._permissionsManager.canPerformAction(Actions.USER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.USER_FIND_ALL);
        }

        try {
            // Merge incoming queryParams with a minimal range to efficiently get the count
            const updatedQueryParams: UserQueryParams = {
                ...queryParams,
                rangeStart: 0,
                rangeEnd: 1,
            };

            // Call the repository with the combined parameters
            const response = await this._repo.getAll(updatedQueryParams);

            // Return the total count from the repository response
            return response.total;
        } catch (error) {
            console.error("Error retrieving filtered users count:", error);
            throw new Error("Failed to retrieve users count.");
        }
    }

    /**
     * Retrieves a list of users, potentially filtered and paginated,
     * enforcing the USER_FIND_ALL permission.
     *
     * @param {UserQueryParams} [queryParams] - Optional parameters for filtering, sorting, and pagination.
     * @returns {Promise<GetUsersResponse>} A promise that resolves to an object containing the list of users
     * for the requested page/filter and the total count of users matching the query.
     * @throws {PermissionError} If the user does not have the USER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving users from the repository.
     */
    public async getUsers(
        queryParams?: UserQueryParams,
    ): Promise<GetUsersResponse> {
        if (!this._permissionsManager.canPerformAction(Actions.USER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.USER_FIND_ALL);
        }

        try {
            // Delegate fetching to the repository
            const response = await this._repo.getAll(queryParams);

            // Convert DTOs returned by the repo into User model instances
            const users = response.results.map(User.fromDTO);

            // Return the users for the current page and the total count
            return { users, total: response.total };
        } catch (error) {
            console.error("Error retrieving users:", error);
            throw new Error("Failed to retrieve users.");
        }
    }

    /**
     * Creates a new user, enforcing the USER_CREATE permission.
     * After creation, it fetches the complete user data.
     *
     * @param {CreateUserDTO} user - The data transfer object containing the details for the new user.
     * @returns {Promise<User>} A promise that resolves to the newly created User object.
     * @throws {PermissionError} If the user does not have the USER_CREATE permission.
     * @throws {Error} If creation fails or the user cannot be found immediately after creation.
     */
    public async createUser(user: CreateUserDTO): Promise<User> {
        if (!this._permissionsManager.canPerformAction(Actions.USER_CREATE)) {
            throw PermissionError.fromAction(Actions.USER_CREATE);
        }

        // Create the user via the repository
        const response = await this._repo.create(user);

        // Fetch the full DTO of the newly created user to ensure we have complete data
        const dto = await this._repo.getById(response.id ?? "");
        if (!dto) {
            throw new Error("User not found immediately after creation!");
        }

        // Convert DTO to User model instance
        return User.fromDTO(dto);
    }

    /**
     * Retrieves a single user by their ID, enforcing the USER_FIND_BY_ID permission.
     *
     * @param {string} userId - The unique identifier of the user to retrieve.
     * @returns {Promise<User | undefined>} A promise that resolves to the User object if found, otherwise undefined.
     * @throws {PermissionError} If the user does not have the USER_FIND_BY_ID permission.
     * @throws {Error} If there is an error retrieving the user from the repository.
     */
    public async getUserById(userId: string): Promise<User | undefined> {
        if (
            !this._permissionsManager.canPerformAction(Actions.USER_FIND_BY_ID)
        ) {
            throw PermissionError.fromAction(Actions.USER_FIND_BY_ID);
        }

        try {
            // Fetch the user DTO by ID from the repository
            const dto = await this._repo.getById(userId);

            // If found, convert DTO to User model instance, otherwise return undefined
            return dto ? User.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving user by ID (${userId}):`,
                error,
            );
            throw new Error("Failed to retrieve user by ID.");
        }
    }

    /**
     * Updates an existing user's data, enforcing the USER_UPDATE permission.
     *
     * @param {string} userId - The unique identifier of the user to update.
     * @param {UpdateUserDTO} data - The data transfer object containing the fields to update.
     * @returns {Promise<User>} A promise that resolves to the updated User object.
     * @throws {PermissionError} If the user does not have the USER_UPDATE permission.
     * @throws {Error} If the update fails or the user is not found.
     */
    public async updateUser(
        userId: string,
        data: UpdateUserDTO,
    ): Promise<User> {
        if (
            !this._permissionsManager.canPerformAction(Actions.USER_UPDATE)
        ) {
            throw PermissionError.fromAction(Actions.USER_UPDATE);
        }

        try {
            // Perform the update via the repository
            const dto = await this._repo.update(userId, data);

            // Convert the returned (updated) DTO to a User model instance
            return User.fromDTO(dto);
        } catch (error) {
            console.error(`Error updating user (${userId}):`, error);
            throw new Error("Failed to update user.");
        }
    }

    /**
     * Deletes a user by their ID, enforcing the USER_DELETE_BY_ID permission.
     *
     * @param {string} userId - The unique identifier of the user to delete.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     * @throws {PermissionError} If the user does not have the USER_DELETE_BY_ID permission.
     * @throws {Error} If the deletion fails (e.g., user not found or database error).
     */
    public async deleteUser(userId: string): Promise<void> {
        if (
            !this._permissionsManager.canPerformAction(Actions.USER_DELETE)
        ) {
            throw PermissionError.fromAction(Actions.USER_DELETE);
        }

        try {
            // Perform the deletion via the repository
            await this._repo.delete(userId);
        } catch (error) {
            console.error(`Error deleting user (${userId}):`, error);
            throw new Error("Failed to delete user.");
        }
    }
}
