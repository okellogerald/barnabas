import { BaseRepository } from "@/data/_common";
import { envelopeContract } from "./contract";
import {
    EnvelopeAssignmentDTO,
    EnvelopeBlockDTO,
    EnvelopeDTO,
    EnvelopeHistoryDTO,
    EnvelopeQueryParams,
} from "./schema";

export class EnvelopeRepository
    extends BaseRepository<typeof envelopeContract> {
    // Default query parameters
    static defaultQueryParams: EnvelopeQueryParams = {
        eager: "member",
        rangeStart: 0,
        rangeEnd: 9,
    };

    constructor() {
        super("envelope", envelopeContract);
    }

    /**
     * Get all envelopes with pagination and filtering
     */
    async getAll(
        params?: EnvelopeQueryParams,
    ): Promise<{ results: EnvelopeDTO[]; total: number }> {
        // Convert any non-string parameters to strings for the query
        const queryParams: Record<string, string> = {};

        if (params) {
            if (params.rangeStart !== undefined) {
                queryParams.rangeStart = String(params.rangeStart);
            }
            if (params.rangeEnd !== undefined) {
                queryParams.rangeEnd = String(params.rangeEnd);
            }
            if (params.eager) queryParams.eager = params.eager;
           // if (params.sort) queryParams.sort = JSON.stringify(params.sort);
            if (params.filter) {
                queryParams.filter = JSON.stringify(params.filter);
            }
            if (params.assigned !== undefined) {
                queryParams.assigned = String(params.assigned);
            }
            if (params.available !== undefined) {
                queryParams.available = String(params.available);
            }
            if (params.memberId) queryParams.memberId = params.memberId;
            if (params.envelopeNumber !== undefined) {
                queryParams.envelopeNumber = String(params.envelopeNumber);
            }
        }

        const result = await this.client.getAll({ query: queryParams });
        return this.handleResponse<{ results: EnvelopeDTO[]; total: number }>(
            result,
            200,
        );
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
