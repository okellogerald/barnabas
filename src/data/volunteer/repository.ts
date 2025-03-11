import { BaseRepository } from "@/data/_common";
import { opportunityContract } from "./contract";
import {
    CreateOpportunityDTO,
    OpportunityDTO,
    UpdateOpportunityDTO,
} from "./schema";

export class OpportunityRepository
    extends BaseRepository<typeof opportunityContract> {
    constructor() {
        super("opportunity", opportunityContract);
    }

    /**
     * Retrieves all volunteer opportunities
     * @returns Array of opportunity data
     */
    async getAll(): Promise<OpportunityDTO[]> {
        const result = await this.client.getAll({});

        return this.handleResponse<OpportunityDTO[]>(result, 200);
    }

    /**
     * Retrieves a specific volunteer opportunity by ID
     * @param id Opportunity ID
     * @returns Opportunity data
     */
    async getById(id: string): Promise<OpportunityDTO> {
        const result = await this.client.getById({
            params: { id },
        });

        return this.handleResponse<OpportunityDTO>(result, 200);
    }

    /**
     * Creates a new volunteer opportunity
     * @param data Opportunity data to create
     * @returns Created opportunity data
     */
    async create(data: CreateOpportunityDTO): Promise<OpportunityDTO> {
        const result = await this.client.create({
            body: data,
        });

        return this.handleResponse<OpportunityDTO>(result, 201);
    }

    /**
     * Updates an existing volunteer opportunity
     * @param id Opportunity ID
     * @param data Opportunity data to update
     * @returns Updated opportunity data
     */
    async update(
        id: string,
        data: UpdateOpportunityDTO,
    ): Promise<OpportunityDTO> {
        const result = await this.client.update({
            params: { id },
            body: data,
        });

        return this.handleResponse<OpportunityDTO>(result, 200);
    }

    /**
     * Deletes a volunteer opportunity
     * @param id Opportunity ID
     * @returns Deleted opportunity data
     */
    async delete(id: string): Promise<OpportunityDTO> {
        const result = await this.client.delete({
            params: { id },
        });

        return this.handleResponse<OpportunityDTO>(result, 200);
    }
}
