import {
    CreateMemberDTO,
    MemberQueryParams,
    MemberRepository,
    UpdateMemberDTO,
} from "@/data/member";
import { Actions, PermissionsManager } from "@/managers/auth/permission";
import { Member } from "@/models";
import { PermissionError } from "@/utilities/errors";

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
 * from the repository and enforcing necessary permissions using PermissionsManager.
 * Implemented as a singleton.
 */
export class MemberManager {
    private static _instance: MemberManager;
    private _repo: MemberRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     * Initializes the manager with necessary dependencies.
     * @param {MemberRepository} repo - The MemberRepository instance for data access.
     * @param {PermissionsManager} permissionsManager - The PermissionsManager instance for permission checks.
     */
    private constructor(
        repo: MemberRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permissionsManager = permissionsManager;
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
                PermissionsManager.instance,
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
     * It determines the count based on the provided `queryParams` by initiating a
     * fetch for the first matching record (`rangeStart: 0`, `rangeEnd: 1`) and
     * retrieving the `total` property from the repository's `getAll` response.
     * While this correctly reflects the filtered count, using a dedicated count method
     * on the repository (if available) would be more performant as this approach
     * potentially fetches unnecessary record data.
     *
     * @param {MemberQueryParams} [queryParams] - Optional parameters for filtering the count. Pagination parameters (`rangeStart`, `rangeEnd`) within this object are ignored.
     * @returns {Promise<number>} A promise that resolves to the total number of members matching the query.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving the count from the repository.
     */
    public async getMembersCount(
        queryParams?: MemberQueryParams,
    ): Promise<number> {
        // Check if the user has permission to find members (as count is derived from finding)
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            // Merge incoming queryParams with a minimal range.
            // This ensures filters are applied, but we only fetch one record
            // primarily to get the total count for the *filtered* set.
            const updatedQueryParams: MemberQueryParams = {
                ...queryParams, // Apply filters/sorting from input
                rangeStart: 0,
                rangeEnd: 1, // Override/set range to fetch only one record
            };
            // Call the repository with the combined parameters
            const response = await this._repo.getAll(updatedQueryParams);
            // Return the total count provided by the repository layer, reflecting the filters applied.
            return response.total;
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
     * @param {MemberQueryParams} [queryParams] - Optional parameters for filtering, sorting, and pagination.
     * @returns {Promise<GetMembersResponse>} A promise that resolves to an object containing the list of members
     * for the requested page/filter and the total count of members matching the query.
     * @throws {PermissionError} If the user does not have the MEMBER_FIND_ALL permission.
     * @throws {Error} If there is an error retrieving members from the repository.
     */
    public async getMembers(
        queryParams?: MemberQueryParams,
    ): Promise<GetMembersResponse> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            // Delegate fetching to the repository
            const response = await this._repo.getAll(queryParams);
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
     * Creates a new member, enforcing the MEMBER_CREATE permission.
     * After creation, it fetches the complete member data.
     *
     * @param {CreateMemberDTO} member - The data transfer object containing the details for the new member.
     * @returns {Promise<Member>} A promise that resolves to the newly created Member object.
     * @throws {PermissionError} If the user does not have the MEMBER_CREATE permission.
     * @throws {Error} If creation fails or the member cannot be found immediately after creation.
     */
    public async createMember(member: CreateMemberDTO): Promise<Member> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
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
        if (
            !this._permissionsManager.hasPermission(Actions.MEMBER_FIND_BY_ID)
        ) {
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
        if (
            !this._permissionsManager.hasPermission(Actions.MEMBER_UPDATE)
        ) {
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
        if (
            !this._permissionsManager.hasPermission(Actions.MEMBER_DELETE_BY_ID)
        ) {
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
