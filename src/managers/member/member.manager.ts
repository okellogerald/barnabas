import { MemberRepository } from "@/data/member";
import {
    Actions,
    PermissionError,
    PermissionsManager,
} from "@/managers/auth/permission";
import { Member } from "@/models";

/**
 * Church Manager
 *
 * Handles all authentication-related logic including login, logout,
 * session management, and permission checking.
 */
export class MemberManager {
    private static _instance: MemberManager;
    private _repo: MemberRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._repo = new MemberRepository();
        this._permissionsManager = PermissionsManager.instance;
    }

    /**
     * Gets the singleton instance of AuthManager
     */
    public static get instance(): MemberManager {
        if (!MemberManager._instance) {
            MemberManager._instance = new MemberManager();
        }
        return MemberManager._instance;
    }

    /**
     * Authenticates a user with the provided credentials
     * @param credentials User credentials (username, password)
     * @returns Whether login was successful
     */
    public async getMembers(): Promise<Member[]> {
        if (
            !this._permissionsManager.hasPermission(Actions.MEMBER_FIND_ALL)
        ) {
            throw PermissionError.fromAction(Actions.MEMBER_FIND_ALL);
        }

        const dtos = await this._repo.getAll();
        const members = dtos.map(Member.fromDTO);
        return members;
    }
}
