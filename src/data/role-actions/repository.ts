import { BaseRepository } from "@/data/shared";
import { roleContract } from "./contract";
import { RoleActionDTO, RoleActionQueryParams } from "./schema";

type GetRoleActionsResponse = {
  results: RoleActionDTO[];
  total: number;
};

/**
 * Repository for managing church roles
 * Provides methods to create, read, update, and delete roles
 */
export class RoleActionRepository extends BaseRepository<typeof roleContract> {
  public readonly roleId: string;

  constructor(args: { roleId: string }) {
    super("role-action", roleContract);
    this.roleId = args.roleId;
  }

  /**
   * Default query parameters for roles
   */
  public static defaultQueryParams: RoleActionQueryParams = {
    rangeStart: 0,
    rangeEnd: 9,
  };

  /**
   * Retrieves all roles with optional filtering, sorting, and pagination.
   * @param queryParams Optional parameters for filtering, sorting, and pagination.
   * @returns Object containing role data array and total count.
   * @throws Error if there's an issue retrieving roles.
   */
  async getAll(): Promise<GetRoleActionsResponse> {
    try {
      const result = await this.client.getAll({
        params: { roleId: this.roleId },
      });
      return this.handleResponse<GetRoleActionsResponse>(result, 200);
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
  ): Promise<RoleActionDTO | undefined> {
    try {
      const result = await this.client.getById({
        params: { roleId: this.roleId, actionId: id },
      });
      if (result.status === 404) {
        return undefined;
      }
      return this.handleResponse<RoleActionDTO>(result, 200);
    } catch (error) {
      console.error(`Error in getById with id ${id}:`, error);
      throw new Error(`Failed to retrieve role with ID ${id}.`);
    }
  }
}
