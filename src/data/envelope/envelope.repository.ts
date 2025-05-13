import { BaseRepository } from "@/data/shared";
import { envelopeContract } from "./envelope.contract";
import {
    EnvelopeAssignmentDTO,
    EnvelopeBlockDTO,
    EnvelopeDTO,
    EnvelopeHistoryDTO,
} from "./envelope.schema";
import { EnvelopeQueryBuilder } from "./envelope.query_builder";

export class EnvelopeRepository
    extends BaseRepository<typeof envelopeContract> {
    constructor() {
        super("envelope", envelopeContract);
    }

    /**
     * Get all envelopes with pagination and filtering
     */
    async getAll(
        queryBuilder: EnvelopeQueryBuilder,
    ): Promise<{ results: EnvelopeDTO[]; total: number }> {
        console.log(queryBuilder.build());
        const result = await this.client.getAll({
            query: queryBuilder.build(),
        });
        return this.handleResponse<{ results: EnvelopeDTO[]; total: number }>(
            result,
            200,
        );
    }

    /**
     * Get count of envelopes with specific criteria
     */
    async getCount(builder: EnvelopeQueryBuilder): Promise<number> {
        // Ensure the builder is configured for count query
        const countBuilder = EnvelopeQueryBuilder.is(builder)
            ? builder.clone().configureForCount()
            : builder;

        // Get just enough data to retrieve the total
        const response = await this.getAll(countBuilder);
        return response.total;
    }

    /**
     * Get available envelopes
     */
    async getAvailable(): Promise<EnvelopeDTO[]> {
        const result = await this.client.getAvailable({});
        return this.handleResponse<EnvelopeDTO[]>(result, 200);
    }

    /**
     * Get envelope by ID
     */
    async getById(id: string): Promise<EnvelopeDTO | null> {
        const result = await this.client.getById({ params: { id } });

        if (result.status === 404) {
            return null;
        }

        return this.handleResponse<EnvelopeDTO>(result, 200);
    }

    /**
     * Get envelope by number
     */
    async getByNumber(number: number): Promise<EnvelopeDTO | null> {
        const result = await this.client.getByNumber({
            params: { number: number.toString() },
        });

        if (result.status === 404) {
            return null;
        }

        return this.handleResponse<EnvelopeDTO>(result, 200);
    }

    /**
     * Get envelope history
     */
    async getHistory(envelopeId: string): Promise<EnvelopeHistoryDTO[]> {
        const result = await this.client.getHistory({
            params: { id: envelopeId },
        });
        return this.handleResponse<EnvelopeHistoryDTO[]>(result, 200);
    }

    /**
     * Create a block of envelopes
     */
    async createBlock(
        data: EnvelopeBlockDTO,
    ): Promise<{ count: number; startNumber: number; endNumber: number }> {
        const result = await this.client.createBlock({ body: data });
        return this.handleResponse<
            { count: number; startNumber: number; endNumber: number }
        >(result, 201);
    }

    /**
     * Delete a block of envelopes
     */
    async deleteBlock(
        data: EnvelopeBlockDTO,
    ): Promise<{ count: number; startNumber: number; endNumber: number }> {
        const result = await this.client.deleteBlock({ body: data });
        return this.handleResponse<
            { count: number; startNumber: number; endNumber: number }
        >(result, 200);
    }

    /**
     * Assign an envelope to a member
     */
    async assign(
        envelopeId: string,
        data: EnvelopeAssignmentDTO,
    ): Promise<EnvelopeDTO> {
        const result = await this.client.assign({
            params: { id: envelopeId },
            body: data,
        });
        return this.handleResponse<EnvelopeDTO>(result, 201);
    }

    /**
     * Release an envelope from a member
     */
    async release(envelopeId: string): Promise<EnvelopeDTO> {
        const result = await this.client.release({
            params: { id: envelopeId },
            body: {},
        });
        return this.handleResponse<EnvelopeDTO>(result, 201);
    }
}
