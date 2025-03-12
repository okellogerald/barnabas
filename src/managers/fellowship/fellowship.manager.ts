import { Actions, PermissionsManager } from "@/managers/auth/permission";
import { FellowshipRepository } from "@/data/fellowship";
import { Fellowship } from "@/models/fellowship/fellowship.model";
import { PermissionError } from "../auth/permission/permission_error";

/**
 * Church Manager
 *
 * Handles all authentication-related logic including login, logout,
 * session management, and permission checking.
 */
export class FellowshipManager {
    private static _instance: FellowshipManager;
    private _repo: FellowshipRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._repo = new FellowshipRepository();
        this._permissionsManager = PermissionsManager.instance;
    }

    /**
     * Gets the singleton instance of AuthManager
     */
    public static get instance(): FellowshipManager {
        if (!FellowshipManager._instance) {
            FellowshipManager._instance = new FellowshipManager();
        }
        return FellowshipManager._instance;
    }

    /**
     * Authenticates a user with the provided credentials
     * @param credentials User credentials (username, password)
     * @returns Whether login was successful
     */
    public async getFellowships(): Promise<Fellowship[]> {
        if (
            !this._permissionsManager.hasPermission(Actions.FELLOWSHIP_FIND_ALL)
        ) {
            throw PermissionError.fromAction(Actions.FELLOWSHIP_FIND_ALL);
        }

        const dtos = await this._repo.getAll();
        const fellowships = dtos.map(Fellowship.fromDTO);
        return fellowships;
    }
}
