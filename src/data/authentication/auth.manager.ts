import { AuthRepository, LoginRequest } from "@/data/authentication";
import { User } from "@/models";
import { useAuthStore } from "../../hooks/auth/use-auth-store";
import { useStore } from "zustand";
import {
    ActionPermission,
    AuthorizationManager,
    ResourceType,
} from "@/data/authorization";

/**
 * Auth Manager
 *
 * Handles all authentication-related logic including login, logout,
 * session management, and permission checking.
 */
export class AuthenticationManager {
    private static _instance: AuthenticationManager;
    private _repo: AuthRepository;
    private _permissionsManager: AuthorizationManager;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._repo = new AuthRepository();
        this._permissionsManager = AuthorizationManager.getInstance();
    }

    /**
     * Gets the singleton instance of AuthManager
     */
    public static get instance(): AuthenticationManager {
        if (!AuthenticationManager._instance) {
            AuthenticationManager._instance = new AuthenticationManager();
        }
        return AuthenticationManager._instance;
    }

    /**
     * Authenticates a user with the provided credentials
     * @param credentials User credentials (username, password)
     * @returns Whether login was successful
     */
    public async login(credentials: LoginRequest): Promise<User> {
        try {
            const response = await this._repo.login(credentials);

            const user = User.fromDTO(response.user);

            // Update store with authentication data
            useAuthStore.getState().setToken(response.token);
            useAuthStore.getState().setUser(user);
            useAuthStore.getState().setAllowedActions(response.allowedActions);

            return user;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    /**
     * Logs out the current user
     */
    public async logout(): Promise<void> {
        try {
            const token = this.getToken();
            if (token) {
                await this._repo.logout();
            }
        } catch (error) {
            // Ignore errors during logout
        } finally {
            useAuthStore.getState().clearAuth();
        }
    }

    /**
     * Checks if the user is authenticated
     */
    public get isAuthenticated(): boolean {
        return this._permissionsManager.isUserAuthenticated;
    }

    /**
     * Gets the current user
     */
    public getUser(): User | null {
        return this._permissionsManager.fetchCurrentUser();
    }

    /**
     * Gets the current user using hooks (for React components)
     */
    public useCurrentUser(): User | null {
        return this._permissionsManager.useAuthUser();
    }

    /**
     * Gets the current user's token
     */
    public getToken(): string | null {
        return useAuthStore.getState().token;
    }

    /**
     * Gets the actions allowed for the current user
     */
    public getAllowedActions(): string[] {
        return this._permissionsManager.getAllowedActions();
    }

    /**
     * Checks if the current user has a specific permission
     * @param action The action to check
     */
    public hasPermission(action: ActionPermission | string): boolean {
        return this._permissionsManager.canPerformAction(action);
    }

    /**
     * Checks if the user has any permissions for a specific resource
     * @param resource The resource type to check
     */
    public hasResourcePermission(resource: ResourceType): boolean {
        return this._permissionsManager.canAccessResource(resource);
    }

    /**
     * Get all permissions for a specific resource
     * @param resource The resource type to get permissions for
     */
    public getResourcePermissions(resource: ResourceType): string[] {
        return this._permissionsManager.fetchResourcePermissions(resource);
    }

    /**
     * Checks if the current user is an admin
     */
    public isAdmin(): boolean {
        return this._permissionsManager.checkIsAdmin();
    }

    /**
     * Hook to check if the user is authenticated
     */
    public useIsAuthenticated = (): boolean => {
        const { token, user } = useStore(useAuthStore);
        return !!token && !!user;
    };

    /**
     * Hook to check if the current user is an admin
     */
    public useIsAdmin = (): boolean => {
        return AuthorizationManager.getInstance().useAdminStatus();
    };
}
