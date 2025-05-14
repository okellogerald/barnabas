import { BaseRepository } from "@/data/shared";
import { roleContract } from "./role.api-contract";
import {
  CreateRoleDTO,
  RoleDTO,
  RoleQueryParams,
  UpdateRoleDTO,
} from "./role.schema";

type GetRolesResponse = {
  results: RoleDTO[];
  total: number;
};

/**
 * Repository for managing church roles
 * Provides methods to create, read, update, and delete roles
 */
export class RoleRepository extends BaseRepository<typeof roleContract> {
  constructor() {
    super("role", roleContract);
  }

  /**
   * Default query parameters for roles
   */
  public static defaultQueryParams: RoleQueryParams = {
    eager: "permissions",
    rangeStart: 0,
    rangeEnd: 9,
  };

  /**
   * Retrieves all roles with optional filtering, sorting, and pagination.
   * @param queryParams Optional parameters for filtering, sorting, and pagination.
   * @returns Object containing role data array and total count.
   * @throws Error if there's an issue retrieving roles.
   */
  async getAll(
    queryParams: RoleQueryParams = RoleRepository.defaultQueryParams,
  ): Promise<GetRolesResponse> {
    try {
      const result = await this.client.getAll({ query: queryParams });
      return this.handleResponse<GetRolesResponse>(result, 200);
    } catch (error) {
      console.error("Error in getAll:", error);
      throw new Error("Failed to retrieve roles.");
    }
  }

  /**
   * Retrieves a specific role by ID.
   * @param id Role ID.
   * @param eager Optional eager loading parameter.
   * @returns Role data.
   * @throws Error if the role is not found or there's an issue retrieving the role.
   */
  async getById(
    id: string,
  ): Promise<RoleDTO | undefined> {
    try {
      const result = await this.client.getById({
        params: { id },
      });
      if (result.status === 404) {
        return undefined;
      }
      return this.handleResponse<RoleDTO>(result, 200);
    } catch (error) {
      console.error(`Error in getById with id ${id}:`, error);
      throw new Error(`Failed to retrieve role with ID ${id}.`);
    }
  }

  /**
   * Creates a new role.
   * @param data Role data to create.
   * @returns Created role data.
   * @throws Error if there's an issue creating the role.
   */
  async create(data: CreateRoleDTO): Promise<RoleDTO> {
    try {
      const result = await this.client.create({ body: data });
      return this.handleResponse<RoleDTO>(result, 201);
    } catch (error) {
      console.error("Error in create:", error);
      throw new Error("Failed to create role.");
    }
  }

  /**
   * Updates an existing role.
   * @param id Role ID.
   * @param data Role data to update.
   * @returns Updated role data.
   * @throws Error if the role is not found or there's an issue updating the role.
   */
  async update(id: string, data: UpdateRoleDTO): Promise<RoleDTO> {
    try {
      const result = await this.client.update({
        params: { id },
        body: data,
      });
      return this.handleResponse<RoleDTO>(result, 200);
    } catch (error) {
      console.error(`Error in update with id ${id}:`, error);
      throw new Error(`Failed to update role with ID ${id}.`);
    }
  }

  /**
   * Deletes a role.
   * @param id Role ID.
   * @returns Deleted role data.
   * @throws Error if the role is not found or there's an issue deleting the role.
   */
  async delete(id: string): Promise<RoleDTO> {
    try {
      const result = await this.client.delete({ params: { id } });
      return this.handleResponse<RoleDTO>(result, 200);
    } catch (error) {
      console.error(`Error in delete with id ${id}:`, error);
      throw new Error(`Failed to delete role with ID ${id}.`);
    }
  }

  /**
   * Assigns permissions to a role.
   * @param id Role ID.
   * @param permissions Array of permission identifiers to assign.
   * @returns Updated role with permissions.
   * @throws Error if there's an issue assigning permissions.
   */
  async assignPermissions(id: string, permissions: string[]): Promise<RoleDTO> {
    try {
      const result = await this.client.assignPermissions({
        params: { id },
        body: { permissions },
      });
      return this.handleResponse<RoleDTO>(result, 200);
    } catch (error) {
      console.error(`Error in assignPermissions with id ${id}:`, error);
      throw new Error(`Failed to assign permissions to role with ID ${id}.`);
    }
  }

  /**
   * Retrieves all permissions available in the system.
   * @returns Array of permission objects with id and name.
   * @throws Error if there's an issue retrieving permissions.
   */
  async getAllPermissions(): Promise<Array<{ id: string; name: string }>> {
    try {
      const result = await this.client.getAllPermissions();
      return this.handleResponse<Array<{ id: string; name: string }>>(
        result,
        200,
      );
    } catch (error) {
      console.error("Error in getAllPermissions:", error);
      throw new Error("Failed to retrieve available permissions.");
    }
  }
}
