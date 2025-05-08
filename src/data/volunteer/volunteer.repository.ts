import { BaseRepository } from "@/data/_common";
import { opportunityContract } from "./volunteer.contract";
import { VolunteerQueryBuilder } from "./volunteer.query_builder";
import {
    CreateOpportunityDTO,
    OpportunityDTO,
    UpdateOpportunityDTO,
} from "./volunteer.schema";

export class VolunteerRepository
    extends BaseRepository<typeof opportunityContract> {
    /**
     * Default query parameters applied to volunteer opportunity requests
     */
    static defaultQueryParams = {
        eager: "interestedMembers",
    };

    constructor() {
        super("opportunity", opportunityContract);
    }

    /**
     * Get all volunteer opportunities with pagination and filtering
     */
    async getAll(
        queryBuilder: VolunteerQueryBuilder,
    ): Promise<{ results: OpportunityDTO[]; total: number }> {
        const query = queryBuilder.build();
        const result = await this.client.getAll({ query });
        const opportunities = this.handleResponse<
            { results: OpportunityDTO[]; total: number }
        >(
            result,
            200,
        );

        return opportunities;
    }

    /**
     * Get count of volunteer opportunities with specific criteria
     */
    async getCount(builder: VolunteerQueryBuilder): Promise<number> {
        // Ensure the builder is configured for count query
        const countBuilder = VolunteerQueryBuilder.is(builder)
            ? builder.clone().configureForCount()
            : builder;

        // Get just enough data to retrieve the total
        const response = await this.getAll(countBuilder);
        return response.total;
    }

    /**
     * Get volunteer opportunity by ID
     */
    async getById(id: string): Promise<OpportunityDTO | null> {
        const result = await this.client.getById({
            params: { id },
        });

        if (result.status === 404) {
            return null;
        }

        return this.handleResponse<OpportunityDTO>(result, 200);
    }

    /**
     * Create a new volunteer opportunity
     */
    async create(data: CreateOpportunityDTO): Promise<OpportunityDTO> {
        const result = await this.client.create({
            body: data,
        });
        return this.handleResponse<OpportunityDTO>(result, 201);
    }

    /**
     * Update an existing volunteer opportunity
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
     * Delete a volunteer opportunity
     */
    async delete(id: string): Promise<OpportunityDTO> {
        const result = await this.client.delete({
            params: { id },
        });
        return this.handleResponse<OpportunityDTO>(result, 200);
    }
}
