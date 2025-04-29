import { useAuthStore } from "@/managers/auth";
import { User } from "@/models";
import { ActionPermission, Actions, ResourceType } from "./constants";
import { useStore } from "zustand";

/**
 * Permissions Manager
 *
 * Handles all permission-related logic including checking permissions,
 * managing allowed actions, and filtering resources based on permissions.
 */
export class PermissionsManager {
    private static _instance: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {}

    /**
     * Gets the singleton instance of PermissionsManager
     */
    public static get instance(): PermissionsManager {
        if (!PermissionsManager._instance) {
            PermissionsManager._instance = new PermissionsManager();
        }
        return PermissionsManager._instance;
    }

    /**
     * Gets all allowed actions from the store
     */
    public getAllowedActions(): string[] {
        return useAuthStore.getState().allowedActions;
    }

    /**
     * Checks if the current user has permission for a specific action
     * @param permission The permission to check
     */
    public hasPermission(permission: ActionPermission | string): boolean {
        return this.getAllowedActions().includes(permission);
    }

    /**
     * Checks if the user has any permissions for a specific resource
     * @param resource The resource type to check
     */
    public hasResourcePermission(resource: ResourceType): boolean {
        const prefix = `${resource}.`;
        return this.getAllowedActions().some((action) =>
            action.startsWith(prefix)
        );
    }

    /**
     * Get all permissions for a specific resource
     * @param resource The resource type to get permissions for
     */
    public getResourcePermissions(resource: ResourceType): string[] {
        const prefix = `${resource}.`;
        return this.getAllowedActions().filter((action) =>
            action.startsWith(prefix)
        );
    }

    /**
     * Checks if the current user is authenticated
     */
    public get isAuthenticated(): boolean {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
    }

    /**
     * Gets the current authenticated user
     */
    public getCurrentUser(): User | null {
        const userJson = useAuthStore.getState().user;
        if (!userJson) return null;

        try {
            return User.fromJson(userJson);
        } catch (error) {
            console.error("Error parsing user from store:", error);
            return null;
        }
    }

    /**
     * Gets the current authenticated user
     */
    public useCurrentUser(): User | null {
        const userJson = useStore(useAuthStore).user;
        if (!userJson) return null;

        try {
            return User.fromJson(userJson);
        } catch (error) {
            console.error("Error parsing user from store:", error);
            return null;
        }
    }

    /**
     * Checks if user is an admin (has all permissions or a specific admin flag)
     * This implementation can be adjusted based on your admin definition
     */
    public isAdmin(): boolean {
        // Get the current user
        const user = this.getCurrentUser();
        if (!user) return false;

        // Get the role name if available
        const roleName = user.getRoleName();

        // Option 1: Check by role name
        if (roleName === "Admin") return true;

        // Option 2: Check by permissions count (adjust as needed)
        const actionCount = Object.keys(Actions).length;
        const userActionCount = this.getAllowedActions().length;

        // If user has all permissions, consider them an admin
        return userActionCount == actionCount;
    }

    /**
     * Checks if user is an admin (has all permissions or a specific admin flag)
     * This implementation can be adjusted based on your admin definition
     */
    public useIsAdmin(): boolean {
        // Get the current user
        const user = this.useCurrentUser();
        if (!user) return false;

        // Get the role name if available
        const roleName = user.getRoleName();

        // Option 1: Check by role name
        if (roleName === "Admin") return true;

        // Option 2: Check by permissions count (adjust as needed)
        const actionCount = Object.keys(Actions).length;
        const userActionCount = this.getAllowedActions().length;

        // If user has all permissions, consider them an admin
        return userActionCount == actionCount;
    }

    /**
     * Hook to check if the current user has a specific permission
     * @param permission The permission to check
     */
    public usePermission = (permission: ActionPermission | string): boolean => {
        const allowedActions = useStore(useAuthStore).allowedActions;
        return allowedActions.includes(permission);
    };

    /**
     * Hook to get all permissions for a specific resource
     * @param resource The resource type
     */
    public useResourcePermissions = (resource: ResourceType): string[] => {
        const allowedActions = useStore(useAuthStore).allowedActions;
        const prefix = `${resource}.`;
        return allowedActions.filter((action) => action.startsWith(prefix));
    };
}
