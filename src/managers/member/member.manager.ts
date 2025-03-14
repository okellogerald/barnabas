import {
    CreateMemberDTO,
    MemberQueryParams,
    MemberRepository,
} from "@/data/member";
import { Actions, PermissionsManager } from "@/managers/auth/permission";
import { Member } from "@/models";
import { PermissionError } from "@/utilities/errors";

type GetMembersResponse = {
    members: Member[];
    total: number;
};

/**
 * Member Manager
 *
 * Handles member-related operations, including retrieving member data and enforcing permissions.
 */
export class MemberManager {
    private static _instance: MemberManager;
    private _repo: MemberRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     * @param repo The MemberRepository instance.
     * @param permissionsManager The PermissionsManager instance.
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
     * @returns The MemberManager instance.
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
     * Retrieves all members, enforcing the MEMBER_FIND_ALL permission.
     * @returns A promise that resolves to an array of Member objects.
     * @throws PermissionError if the user does not have the required permission.
     * @throws Error if there is an error retrieving members from the repository.
     */
    public async getMembers(
        queryParams?: MemberQueryParams,
    ): Promise<GetMembersResponse> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_FIND_ALL)) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        try {
            const response = await this._repo.getAll(queryParams);
            const members = response.results.map(Member.fromDTO);
            return { members, total: response.total };
        } catch (error) {
            console.error("Error retrieving members:", error);
            throw new Error("Failed to retrieve members.");
        }
    }

    public async createMember(member: CreateMemberDTO): Promise<Member> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }
        const response = await this._repo.create(member);
        const dto = await this._repo.getById(response.id);
        return Member.fromDTO(dto);
    }
}
