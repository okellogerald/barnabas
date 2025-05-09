import { BaseRepository } from "@/data/_common";
import { memberContract } from "./member.contract";
import {
    CreateMemberDTO,
    MemberDTO,
    MemberQueryParams,
    UpdateMemberDTO,
} from "./member.schema";

type GetMembersResponse = {
    results: MemberDTO[];
    total: number;
};

export class MemberRepository extends BaseRepository<typeof memberContract> {
    constructor() {
        super("member", memberContract);
    }

    static defaultQueryParams: MemberQueryParams = {
        eager: "fellowship",
        rangeStart: 0,
        rangeEnd: 9,
    };

    /**
     * Retrieves all members with optional filtering, sorting, and pagination.
     * @param queryParams Optional parameters for filtering, sorting, and pagination.
     * @returns Object containing member data array and total count.
     * @throws Error if there's an issue retrieving members.
     */
    async getAll(
        queryParams: MemberQueryParams = MemberRepository.defaultQueryParams,
    ): Promise<GetMembersResponse> {
        try {
            const result = await this.client.getAll({ query: queryParams });
            return this.handleResponse<GetMembersResponse>(result, 200);
        } catch (error) {
            console.error("Error in getAll:", error);
            throw new Error("Failed to retrieve members.");
        }
    }

    /**
     * Retrieves a specific member by ID.
     * @param id Member ID.
     * @param eager Optional eager loading parameter.
     * @returns Member data.
     * @throws Error if the member is not found or there's an issue retrieving the member.
     */
    async getById(
        id: string,
        //eager: string = "fellowship,interests,dependants",
        eager: string = "fellowship",
    ): Promise<MemberDTO | undefined> {
        try {
            const result = await this.client.getById({
                params: { id },
                query: { eager },
            });
            if (result.status === 404) {
                return undefined;
            }
            return this.handleResponse<MemberDTO>(result, 200);
        } catch (error) {
            console.error(`Error in getById with id ${id}:`, error);
            throw new Error(`Failed to retrieve member with ID ${id}.`);
        }
    }

    /**
     * Creates a new member.
     * @param data Member data to create.
     * @returns Created member data.
     * @throws Error if there's an issue creating the member.
     */
    async create(data: CreateMemberDTO): Promise<MemberDTO> {
        try {
            const result = await this.client.create({ body: data });
            return this.handleResponse<MemberDTO>(result, 201);
        } catch (error) {
            console.error("Error in create:", error);
            throw new Error("Failed to create member.");
        }
    }

    /**
     * Updates an existing member.
     * @param id Member ID.
     * @param data Member data to update.
     * @returns Updated member data.
     * @throws Error if the member is not found or there's an issue updating the member.
     */
    async update(id: string, data: UpdateMemberDTO): Promise<MemberDTO> {
        try {
            const result = await this.client.update({
                params: { id },
                body: data,
            });
            return this.handleResponse<MemberDTO>(result, 200);
        } catch (error) {
            console.error(`Error in update with id ${id}:`, error);
            throw new Error(`Failed to update member with ID ${id}.`);
        }
    }

    /**
     * Deletes a member.
     * @param id Member ID.
     * @returns Deleted member data.
     * @throws Error if the member is not found or there's an issue deleting the member.
     */
    async delete(id: string): Promise<MemberDTO> {
        try {
            const result = await this.client.delete({ params: { id } });
            return this.handleResponse<MemberDTO>(result, 200);
        } catch (error) {
            console.error(`Error in delete with id ${id}:`, error);
            throw new Error(`Failed to delete member with ID ${id}.`);
        }
    }

    /**
     * Searches for members by name or contact information.
     * @param searchTerm Text to search for.
     * @returns Object containing member data array and total count.
     * @throws Error if there's an issue searching for members.
     */
    async search(searchTerm: string): Promise<GetMembersResponse> {
        try {
            return this.getAll({
                ...MemberRepository.defaultQueryParams,
                search: searchTerm,
            });
        } catch (error) {
            console.error(`Error in search with term ${searchTerm}:`, error);
            throw new Error(
                `Failed to search members with term ${searchTerm}.`,
            );
        }
    }

    /**
     * Gets members by fellowship.
     * @param fellowshipId Fellowship ID.
     * @returns Object containing member data array and total count.
     * @throws Error if there's an issue retrieving members by fellowship.
     */
    async getByFellowship(fellowshipId: string): Promise<GetMembersResponse> {
        try {
            return this.getAll({
                ...MemberRepository.defaultQueryParams,
                fellowshipId,
            });
        } catch (error) {
            console.error(
                `Error in getByFellowship with id ${fellowshipId}:`,
                error,
            );
            throw new Error(
                `Failed to retrieve members by fellowship ID ${fellowshipId}.`,
            );
        }
    }

    /**
     * Gets members by baptism status.
     * @param baptized Baptism status to filter by.
     * @returns Object containing member data array and total count.
     * @throws Error if there's an issue retrieving members by baptism status.
     */
    async getByBaptismStatus(baptized: boolean): Promise<GetMembersResponse> {
        try {
            return this.getAll({
                ...MemberRepository.defaultQueryParams,
                baptized,
            });
        } catch (error) {
            console.error(
                `Error in getByBaptismStatus with status ${baptized}:`,
                error,
            );
            throw new Error(
                `Failed to retrieve members by baptism status ${baptized}.`,
            );
        }
    }
}
