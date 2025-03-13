import { Church } from "@/models";
import { ChurchRepository } from "@/data/church";

/**
 * Church Manager
 *
 * Handles all authentication-related logic including login, logout,
 * session management, and permission checking.
 */
export class ChurchManager {
    private static _instance: ChurchManager;
    private _repo: ChurchRepository;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._repo = new ChurchRepository();
    }

    /**
     * Gets the singleton instance of AuthManager
     */
    public static get instance(): ChurchManager {
        if (!ChurchManager._instance) {
            ChurchManager._instance = new ChurchManager();
        }
        return ChurchManager._instance;
    }

    /**
     * Authenticates a user with the provided credentials
     * @param credentials User credentials (username, password)
     * @returns Whether login was successful
     */
    public async getUserChurch(): Promise<Church> {
        const dto = await this._repo.getCurrentChurch();
        const church = Church.fromDTO(dto);
        return church;
    }
}
