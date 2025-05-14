import { BaseRepository } from "@/data/shared";
import { fellowshipContract } from "./fellowship.api-contract";
import {
    CreateFellowshipDTO,
    FellowshipDTO,
    FellowshipQueryParams,
    UpdateFellowshipDTO,
} from "./fellowship.schema";

type GetFellowshipsResponse = {
    results: FellowshipDTO[];
    total: number;
};

export class FellowshipRepository
    extends BaseRepository<typeof fellowshipContract> {
    constructor() {
        super("fellowship", fellowshipContract);
    }

    public static defaultQueryParams: FellowshipQueryParams = {
        eager: "[chairman,deputyChairman,secretary,treasurer]",
        rangeStart: 0,
        rangeEnd: 9,
    };

    /**
     * Retrieves all fellowships with optional filtering, sorting, and pagination.
     * @param queryParams Optional parameters for filtering, sorting, and pagination.
     * @returns Object containing fellowship data array and total count.
     * @throws Error if there's an issue retrieving fellowships.
     */
    async getAll(
        queryParams: FellowshipQueryParams =
            FellowshipRepository.defaultQueryParams,
    ): Promise<GetFellowshipsResponse> {
        try {
            const result = await this.client.getAll({ query: queryParams });
            return this.handleResponse<GetFellowshipsResponse>(result, 200);
        } catch (error) {
            console.error("Error in getAll:", error);
            throw new Error("Failed to retrieve fellowships.");
        }
    }

    /**
     * Retrieves a specific fellowship by ID.
     * @param id Fellowship ID.
     * @param eager Optional eager loading parameter.
     * @returns Fellowship data.
     * @throws Error if the fellowship is not found or there's an issue retrieving the fellowship.
     */
    async getById(
        id: string,
        eager: string = "chairman,deputyChairman,secretary,treasurer",
    ): Promise<FellowshipDTO | undefined> {
        try {
            const result = await this.client.getById({
                params: { id },
                query: { eager },
            });
            if (result.status === 404) {
                return undefined;
            }
            return this.handleResponse<FellowshipDTO>(result, 200);
        } catch (error) {
            console.error(`Error in getById with id ${id}:`, error);
            throw new Error(`Failed to retrieve fellowship with ID ${id}.`);
        }
    }

    /**
     * Creates a new fellowship.
     * @param data Fellowship data to create.
     * @returns Created fellowship data.
     * @throws Error if there's an issue creating the fellowship.
     */
    async create(data: CreateFellowshipDTO): Promise<FellowshipDTO> {
        try {
            const result = await this.client.create({ body: data });
            return this.handleResponse<FellowshipDTO>(result, 201);
        } catch (error) {
            console.error("Error in create:", error);
            throw new Error("Failed to create fellowship.");
        }
    }

    /**
     * Updates an existing fellowship.
     * @param id Fellowship ID.
     * @param data Fellowship data to update.
     * @returns Updated fellowship data.
     * @throws Error if the fellowship is not found or there's an issue updating the fellowship.
     */
    async update(
        id: string,
        data: UpdateFellowshipDTO,
    ): Promise<FellowshipDTO> {
        try {
            const result = await this.client.update({
                params: { id },
                body: data,
            });
            return this.handleResponse<FellowshipDTO>(result, 200);
        } catch (error) {
            console.error(`Error in update with id ${id}:`, error);
            throw new Error(`Failed to update fellowship with ID ${id}.`);
        }
    }

    /**
     * Deletes a fellowship.
     * @param id Fellowship ID.
     * @returns Deleted fellowship data.
     * @throws Error if the fellowship is not found or there's an issue deleting the fellowship.
     */
    async delete(id: string): Promise<FellowshipDTO> {
        try {
            const result = await this.client.delete({ params: { id } });
            return this.handleResponse<FellowshipDTO>(result, 200);
        } catch (error) {
            console.error(`Error in delete with id ${id}:`, error);
            throw new Error(`Failed to delete fellowship with ID ${id}.`);
        }
    }
}
