import { BaseRepository } from "@/data/_common";
import { roleContract } from "./contract";
import { RoleDTO } from "./schema";

export class RoleRepository extends BaseRepository<typeof roleContract> {
    constructor() {
        super("role", roleContract);
    }

    /**
     * Retrieves all roles
     * @returns Array of role data
     */
    async getAll(): Promise<RoleDTO[]> {
        const result = await this.client.getAll({});

        const response = this.handleResponse<{ data: RoleDTO[] }>(result, 200);
        return response.data;
    }

    /**
     * Retrieves a specific role by ID
     * @param id Role ID
     * @returns Role data
     */
    async getById(id: string): Promise<RoleDTO> {
        const result = await this.client.getById({
            params: { id },
        });

        return this.handleResponse<RoleDTO>(result, 200);
    }
}
