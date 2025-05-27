import {
    CreateMemberDTO,
    MemberRepository,
    UpdateMemberDTO,
} from "@/data/member";
import { Actions, AuthorizationManager } from "@/data/authorization";
import { Member } from "@/models";
import { PermissionError } from "@/lib/error";
import {
    MemberQueryBuilder,
    MemberQueryCriteria,
} from "@/data/member/member.query-builder";

/**
 * @typedef {object} GetMembersResponse
 * @property {Member[]} members - An array of member objects.
 * @property {number} total - The total number of members matching the query (regardless of pagination).
 */
type GetMembersResponse = {
    members: Member[];
    total: number;
};

/**
 * Member Manager
 *
 * Handles member-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using AuthorizationManager.
 * Implemented as a singleton.
 */
export class MemberManager {
    private static _instance: MemberManager;
    private _repo: MemberRepository;
    private _permManager: AuthorizationManager;

    /**
     * Private constructor to enforce singleton pattern.
     * Initializes the manager with necessary dependencies.
     * @param {MemberRepository} repo - The MemberRepository instance for data access.
     * @param {AuthorizationManager} permissionsManager - The AuthorizationManager instance for permission checks.
     */
    private constructor(
        repo: MemberRepository,
        permissionsManager: AuthorizationManager,
    ) {
        this._repo = repo;
        this._permManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of MemberManager.
     * Creates the instance if it doesn't exist yet.
     * @returns {MemberManager} The singleton MemberManager instance.
     */
    public static get instance(): MemberManager {
        if (!MemberManager._instance) {
            MemberManager._instance = new MemberManager(
                new MemberRepository(),
                AuthorizationManager.getInstance(),
            );
        }
        return MemberManager._instance;
    }

    /**
     * Retrieves the total count of members matching the optional query parameters,
     * enforcing the MEMBER_FIND_ALL permission.
     *
     * @remarks
     * This method requires the `MEMBER_FIND_ALL` permission.
     * It uses the QueryBuilder to construct a query that returns only the count.
     *
     * @param {MemberQueryCriteria | MemberQueryBuilder} options - Optional criteria or builder for filtering the count.
     * @returns {Promise<number>} A promise that resolves to the total number of members matching the query.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving the count from the repository.
     */
    public async getMembersCount(
        options?: Parameters<MemberRepository["getCount"]>[0],
    ): Promise<number> {
        // Check if the user has permission to find members (as count is derived from finding)
        if (!this._permManager.canPerformAction(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            const count = await this._repo.getCount(options);
            return count;
        } catch (error) {
            // Log the error for debugging purposes on the server
            console.error("Error retrieving filtered members count:", error);
            // Throw a generic error to the caller
            throw new Error("Failed to retrieve members count.");
        }
    }

    /**
     * Retrieves a list of members, potentially filtered and paginated,
     * enforcing the MEMBER_FIND_ALL permission.
     *
     * @param {MemberQueryCriteria | MemberQueryBuilder} options - Optional criteria or builder for filtering, sorting, and pagination.
     * @returns {Promise<GetMembersResponse>} A promise that resolves to an object containing the list of members
     * for the requested page/filter and the total count of members matching the query.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving members from the repository.
     */
    public async getPaginatedMembers(
        options?: MemberQueryCriteria | MemberQueryBuilder,
    ): Promise<GetMembersResponse> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            // Create a query builder from the options
            const builder = MemberQueryBuilder.from(options);

            // Execute the query
            const response = await this._repo.getPaginated(builder);

            // Convert DTOs returned by the repo into Member model instances
            const members = response.results.map(Member.fromDTO);

            // Return the members for the current page and the total count
            return { members, total: response.total };
        } catch (error) {
            console.error("Error retrieving members:", error);
            throw new Error("Failed to retrieve members.");
        }
    }

    /**
     * Retrieves a list of members
     * enforcing the MEMBER_FIND_ALL permission.
     *
     * @param {MemberQueryCriteria | MemberQueryBuilder} options - Optional criteria or builder for filtering, sorting, and pagination.
     * @returns {Promise<GetMembersResponse>} A promise that resolves to an object containing the list of members
     * for the requested page/filter and the total count of members matching the query.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving members from the repository.
     */
    public async getMembers(
        options?: MemberQueryCriteria | MemberQueryBuilder,
    ): Promise<Member[]> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            // Create a query builder from the options
            const builder = MemberQueryBuilder.from(options);

            // Execute the query
            const response = await this._repo.getList(builder);

            // Convert DTOs returned by the repo into Member model instances
            const members = response.map(Member.fromDTO);

            // Return the members for the current page and the total count
            return members;
        } catch (error) {
            console.error("Error retrieving members:", error);
            throw new Error("Failed to retrieve members.");
        }
    }

    /**
     * Creates a new member, enforcing the MEMBER_CREATE permission.
     * After creation, it fetches the complete member data.
     *
     * @param {CreateMemberDTO} member - The data transfer object containing the details for the new member.
     * @returns {Promise<Member>} A promise that resolves to the newly created Member object.
     * @throws {PermissionError} If the user does not have the MEMBER_CREATE permission.
     * @throws {Error} If creation fails or the member cannot be found immediately after creation.
     */
    public async createMember(member: CreateMemberDTO): Promise<Member> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }
        // Create the member via the repository
        const response = await this._repo.create(member);
        // Fetch the full DTO of the newly created member to ensure we have complete data
        const dto = await this._repo.getById(response.id);
        if (!dto) {
            throw new Error("Member not found immediately after creation!");
        }
        // Convert DTO to Member model instance
        return Member.fromDTO(dto);
    }

    /**
     * Retrieves a single member by their ID, enforcing the MEMBER_FIND_BY_ID permission.
     *
     * @param {string} memberId - The unique identifier of the member to retrieve.
     * @returns {Promise<Member | undefined>} A promise that resolves to the Member object if found, otherwise undefined.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_BY_ID permission.
     * @throws {Error} If there is an error retrieving the member from the repository.
     */
    public async getMemberByID(memberId: string): Promise<Member | undefined> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_FIND_BY_ID)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_BY_ID);
        }

        try {
            // Fetch the member DTO by ID from the repository
            const dto = await this._repo.getById(memberId);
            // If found, convert DTO to Member model instance, otherwise return undefined
            return dto ? Member.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving member by ID (${memberId}):`,
                error,
            );
            throw new Error("Failed to retrieve member by ID.");
        }
    }

    /**
     * Updates an existing member's data, enforcing the MEMBER_UPDATE permission.
     *
     * @param {string} memberId - The unique identifier of the member to update.
     * @param {UpdateMemberDTO} data - The data transfer object containing the fields to update.
     * @returns {Promise<Member>} A promise that resolves to the updated Member object.
     * @throws {PermissionError} If the user does not have the MEMBER_UPDATE permission.
     * @throws {Error} If the update fails or the member is not found.
     */
    public async updateMember(
        memberId: string,
        data: UpdateMemberDTO,
    ): Promise<Member> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_UPDATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_UPDATE);
        }

        try {
            // Perform the update via the repository
            const dto = await this._repo.update(memberId, data);
            // Convert the returned (updated) DTO to a Member model instance
            return Member.fromDTO(dto);
        } catch (error) {
            console.error(`Error updating member (${memberId}):`, error);
            // Consider differentiating between "not found" errors and other update errors if repo provides that
            throw new Error("Failed to update member.");
        }
    }

    /**
     * Deletes a member by their ID, enforcing the MEMBER_DELETE_BY_ID permission.
     *
     * @param {string} memberId - The unique identifier of the member to delete.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     * @throws {PermissionError} If the user does not have the MEMBER_DELETE_BY_ID permission.
     * @throws {Error} If the deletion fails (e.g., member not found or database error).
     */
    public async deleteMember(memberId: string): Promise<void> {
        if (!this._permManager.canPerformAction(Actions.MEMBER_DELETE_BY_ID)) {
            throw PermissionError.fromAction(Actions.MEMBER_DELETE_BY_ID);
        }

        try {
            // Perform the deletion via the repository
            await this._repo.delete(memberId);
        } catch (error) {
            console.error(`Error deleting member (${memberId}):`, error);
            // Consider differentiating between "not found" errors and other delete errors if repo provides that
            throw new Error("Failed to delete member.");
        }
    }
}
