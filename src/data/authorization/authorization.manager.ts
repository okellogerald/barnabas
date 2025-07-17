import { useAuthStore } from "@/hooks/auth";
import { User } from "@/models";
import { ActionPermission, Actions, ResourceType } from "./authorization.types";
import { useStore } from "zustand";

/**
 * Authorization Manager
 *
 * Handles all permission-related logic including checking permissions,
 * managing allowed actions, and filtering resources based on permissions.
 */
export class AuthorizationManager {
  private static _instance: AuthorizationManager;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Gets the singleton instance of PermissionsManager
   */
  public static getInstance(): AuthorizationManager {
    if (!AuthorizationManager._instance) {
      AuthorizationManager._instance = new AuthorizationManager();
    }
    return AuthorizationManager._instance;
  }

  /**
   * Gets all allowed actions from the store
   */
  public getAllowedActions(): string[] {
    return useAuthStore.getState().allowedActions;
  }

  /**
   * Checks if the current user has permission for a specific action
   * @param action The permission to check
   */
  public canPerformAction(action: ActionPermission | string): boolean {
    return this.getAllowedActions().includes(action);
  }

  /**
   * Checks if the user has any permissions for a specific resource
   * @param resource The resource type to check
   */
  public canAccessResource(resource: ResourceType): boolean {
    const prefix = `${resource}.`;
    return this.getAllowedActions().some((action) => action.startsWith(prefix));
  }

  /**
   * Get all permissions for a specific resource
   * @param resource The resource type to get permissions for
   */
  public fetchResourcePermissions(resource: ResourceType): string[] {
    const prefix = `${resource}.`;
    return this.getAllowedActions().filter((action) => action.startsWith(prefix));
  }

  /**
   * Checks if the current user is authenticated
   */
  public get isUserAuthenticated(): boolean {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  }

  /**
   * Gets the current authenticated user
   */
  public fetchCurrentUser(): User | null {
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
  public useAuthUser(): User | null {
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
  public checkIsAdmin(): boolean {
    // Get the current user
    const user = this.fetchCurrentUser();
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
  public useAdminStatus(): boolean {
    // Get the current user
    const user = this.useAuthUser();
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
  public useCanPerformAction = (permission: ActionPermission | string): boolean => {
    const allowedActions = useStore(useAuthStore).allowedActions;
    return allowedActions.includes(permission);
  };

  /**
   * Hook to get all permissions for a specific resource
   * @param resource The resource type
   */
  public useFetchResourcePermissions = (resource: ResourceType): string[] => {
    const allowedActions = useStore(useAuthStore).allowedActions;
    const prefix = `${resource}.`;
    return allowedActions.filter((action) => action.startsWith(prefix));
  };
}
