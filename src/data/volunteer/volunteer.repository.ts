import { BaseRepository } from "@/data/_common";
import { volunteerOpportunityContract } from "./volunteer.contract";
import { VolunteerOpportunityQueryBuilder } from "./volunteer.query_builder";
import {
    CreateVolunteerOpportunityDTO,
    UpdateVolunteerOpportunityDTO,
    VolunteerOpportunityDTO,
} from "./volunteer.schema";

export class VolunteerOpportunityRepository
    extends BaseRepository<typeof volunteerOpportunityContract> {
    /**
     * Default query parameters applied to volunteer opportunity requests
     */
    static defaultQueryParams = {
        eager: "interestedMembers",
    };

    constructor() {
        super("opportunity", volunteerOpportunityContract);
    }

    /**
     * Get all volunteer opportunities with pagination and filtering
     */
    async getAll(
        queryBuilder: VolunteerOpportunityQueryBuilder,
    ): Promise<{ results: VolunteerOpportunityDTO[]; total: number }> {
        const query = queryBuilder.build();
        const result = await this.client.getAll({ query });
        const opportunities = this.handleResponse<
            { results: VolunteerOpportunityDTO[]; total: number }
        >(
            result,
            200,
        );

        return opportunities;
    }

    /**
     * Get count of volunteer opportunities with specific criteria
     */
    async getCount(builder: VolunteerOpportunityQueryBuilder): Promise<number> {
        // Ensure the builder is configured for count query
        const countBuilder = VolunteerOpportunityQueryBuilder.is(builder)
            ? builder.clone().configureForCount()
            : builder;

        // Get just enough data to retrieve the total
        const response = await this.getAll(countBuilder);
        return response.total;
    }

    /**
     * Get volunteer opportunity by ID
     */
    async getById(id: string): Promise<VolunteerOpportunityDTO | null> {
        const result = await this.client.getById({
            params: { id },
        });

        if (result.status === 404) {
            return null;
        }

        return this.handleResponse<VolunteerOpportunityDTO>(result, 200);
    }

    /**
     * Create a new volunteer opportunity
     */
    async create(
        data: CreateVolunteerOpportunityDTO,
    ): Promise<VolunteerOpportunityDTO> {
        const result = await this.client.create({
            body: data,
        });
        return this.handleResponse<VolunteerOpportunityDTO>(result, 201);
    }

    /**
     * Update an existing volunteer opportunity
     */
    async update(
        id: string,
        data: UpdateVolunteerOpportunityDTO,
    ): Promise<VolunteerOpportunityDTO> {
        const result = await this.client.update({
            params: { id },
            body: data,
        });
        return this.handleResponse<VolunteerOpportunityDTO>(result, 200);
    }

    /**
     * Delete a volunteer opportunity
     */
    async delete(id: string): Promise<VolunteerOpportunityDTO> {
        const result = await this.client.delete({
            params: { id },
        });
        return this.handleResponse<VolunteerOpportunityDTO>(result, 200);
    }
}
