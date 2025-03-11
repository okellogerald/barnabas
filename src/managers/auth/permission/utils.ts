import { ActionPermission } from "./constants";
import { PermissionsManager } from "./manager";

/**
 * Higher-order function for guarding function calls with permission checks
 * @param permission The permission required to execute the function
 * @param fn The function to guard
 * @param fallback Optional fallback function to call if permission is denied
 */
export function withPermissionCheck<T extends (...args: any[]) => any>(
    permission: ActionPermission | string,
    fn: T,
    fallback?: () => any,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
        const permManager = PermissionsManager.instance;

        if (permManager.hasPermission(permission)) {
            return fn(...args);
        }

        if (fallback) {
            return fallback() as ReturnType<T>;
        }

        console.warn(`Permission denied: ${permission}`);
        return undefined;
    };
}

/**
 * Group permissions by resource for UI display
 * @param permissions Array of permission strings
 */
export function groupPermissionsByResource(
    permissions: string[],
): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const permission of permissions) {
        const [resource] = permission.split(".");

        if (!result[resource]) {
            result[resource] = [];
        }

        result[resource].push(permission);
    }

    return result;
}

/**
 * Format permission for display
 * @param permission Permission string to format
 */
export function formatPermission(permission: string): string {
    const [resource, action] = permission.split(".");
    return `${resource.charAt(0).toUpperCase() + resource.slice(1)} - ${
        action.charAt(0).toUpperCase() + action.slice(1)
    }`;
}
