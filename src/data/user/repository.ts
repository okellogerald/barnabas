import { BaseRepository } from "@/data/_common";
import { userContract } from "./contract";
import {
    CreateUserDTO,
    UpdateUserDTO,
    UserDTO,
    UserQueryParams,
} from "./schema";

type GetUsersResponse = {
    results: UserDTO[];
    total: number;
};

export class UserRepository extends BaseRepository<typeof userContract> {
    constructor() {
        super("user", userContract);
    }

    static defaultQueryParams: UserQueryParams = {
        //eager: "role",
        rangeStart: 0,
        rangeEnd: 9,
    };

    /**
     * Retrieves all users with optional filtering, sorting, and pagination.
     * @param queryParams Optional parameters for filtering, sorting, and pagination.
     * @returns Object containing user data array and total count.
     * @throws Error if there's an issue retrieving users.
     */
    async getAll(
        queryParams: UserQueryParams = UserRepository.defaultQueryParams,
    ): Promise<GetUsersResponse> {
        try {
            const result = await this.client.getAll({ query: queryParams });
            return this.handleResponse<GetUsersResponse>(result, 200);
        } catch (error) {
            console.error("Error in getAll:", error);
            throw new Error("Failed to retrieve users.");
        }
    }

    /**
     * Retrieves a specific user by ID.
     * @param id User ID.
     * @param eager Optional eager loading parameter.
     * @returns User data.
     * @throws Error if the user is not found or there's an issue retrieving the user.
     */
    async getById(
        id: string,
       // eager: string = "role",
    ): Promise<UserDTO | undefined> {
        try {
            const result = await this.client.getById({
                params: { id },
               // query: { eager },
            });
            if (result.status === 404) {
                return undefined;
            }
            return this.handleResponse<UserDTO>(result, 200);
        } catch (error) {
            console.error(`Error in getById with id ${id}:`, error);
            throw new Error(`Failed to retrieve user with ID ${id}.`);
        }
    }

    /**
     * Creates a new user.
     * @param data User data to create.
     * @returns Created user data.
     * @throws Error if there's an issue creating the user.
     */
    async create(data: CreateUserDTO): Promise<UserDTO> {
        try {
            const result = await this.client.create({ body: data });
            return this.handleResponse<UserDTO>(result, 201);
        } catch (error) {
            console.error("Error in create:", error);
            throw new Error("Failed to create user.");
        }
    }

    /**
     * Updates an existing user.
     * @param id User ID.
     * @param data User data to update.
     * @returns Updated user data.
     * @throws Error if the user is not found or there's an issue updating the user.
     */
    async update(id: string, data: UpdateUserDTO): Promise<UserDTO> {
        try {
            const result = await this.client.update({
                params: { id },
                body: data,
            });
            return this.handleResponse<UserDTO>(result, 200);
        } catch (error) {
            console.error(`Error in update with id ${id}:`, error);
            throw new Error(`Failed to update user with ID ${id}.`);
        }
    }

    /**
     * Deletes a user.
     * @param id User ID.
     * @returns Deleted user data.
     * @throws Error if the user is not found or there's an issue deleting the user.
     */
    async delete(id: string): Promise<UserDTO> {
        try {
            const result = await this.client.delete({ params: { id } });
            return this.handleResponse<UserDTO>(result, 200);
        } catch (error) {
            console.error(`Error in delete with id ${id}:`, error);
            throw new Error(`Failed to delete user with ID ${id}.`);
        }
    }

    /**
     * Gets users by role.
     * @param roleId Role ID.
     * @returns Object containing user data array and total count.
     * @throws Error if there's an issue retrieving users by role.
     */
    async getByRole(roleId: string): Promise<GetUsersResponse> {
        try {
            return this.getAll({
                ...UserRepository.defaultQueryParams,
                roleId,
            });
        } catch (error) {
            console.error(`Error in getByRole with id ${roleId}:`, error);
            throw new Error(`Failed to retrieve users by role ID ${roleId}.`);
        }
    }

    /**
     * Gets users by active status.
     * @param isActive Active status to filter by.
     * @returns Object containing user data array and total count.
     * @throws Error if there's an issue retrieving users by active status.
     */
    async getByActiveStatus(isActive: boolean): Promise<GetUsersResponse> {
        try {
            return this.getAll({
                ...UserRepository.defaultQueryParams,
                isActive: Number(isActive)
            });
        } catch (error) {
            console.error(
                `Error in getByActiveStatus with status ${isActive}:`,
                error,
            );
            throw new Error(
                `Failed to retrieve users by active status ${isActive}.`,
            );
        }
    }
}
