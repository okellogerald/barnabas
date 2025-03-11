import { BaseRepository } from "@/data/_common";
import { memberContract } from "./contract";
import { CreateMemberDTO, MemberDTO, UpdateMemberDTO } from "./schema";

export class MemberRepository extends BaseRepository<typeof memberContract> {
    constructor() {
        super("member", memberContract);
    }

    /**
     * Retrieves all members
     * @returns Array of member data
     */
    async getAll(): Promise<MemberDTO[]> {
        const result = await this.client.getAll({});

        return this.handleResponse<MemberDTO[]>(result, 200);
    }

    /**
     * Retrieves a specific member by ID
     * @param id Member ID
     * @returns Member data
     */
    async getById(id: string): Promise<MemberDTO> {
        const result = await this.client.getById({
            params: { id },
        });

        return this.handleResponse<MemberDTO>(result, 200);
    }

    /**
     * Creates a new member
     * @param data Member data to create
     * @returns Created member data
     */
    async create(data: CreateMemberDTO): Promise<MemberDTO> {
        const result = await this.client.create({
            body: data,
        });

        return this.handleResponse<MemberDTO>(result, 201);
    }

    /**
     * Updates an existing member
     * @param id Member ID
     * @param data Member data to update
     * @returns Updated member data
     */
    async update(id: string, data: UpdateMemberDTO): Promise<MemberDTO> {
        const result = await this.client.update({
            params: { id },
            body: data,
        });

        return this.handleResponse<MemberDTO>(result, 200);
    }

    /**
     * Deletes a member
     * @param id Member ID
     * @returns Deleted member data
     */
    async delete(id: string): Promise<MemberDTO> {
        const result = await this.client.delete({
            params: { id },
        });

        return this.handleResponse<MemberDTO>(result, 200);
    }
}
