import { PermissionError } from "@/lib/error";
import {
    ActionPermission,
    PermissionsManager,
} from "@/features/auth/permission";

/**
 * Decorator to enforce permission checks before executing a method.
 *
 * @param permission - The specific action permission required.
 * @param fallback - Optional fallback function to execute if permission is denied.
 *
 * @example
 * ```typescript
 * @RequiresPermission(Actions.ENVELOPE_FIND_ALL)
 * public async getEnvelopes() {
 *   // Your logic here...
 * }
 * ```
 */
export function RequiresPermission(
    permission: string,
    fallback?: (...args: any[]) => any,
) {
    return function <T>(
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<T>,
    ): void {
        if (!descriptor || typeof descriptor.value !== "function") {
            throw new Error(
                `@RequiresPermission can only be applied to methods, not to '${propertyKey}' ${target}`,
            );
        }

        const originalMethod = descriptor.value;

        descriptor.value = (async function (this: any, ...args: any[]) {
            const permissionsManager = PermissionsManager.getInstance();

            if (!permissionsManager.canPerformAction(permission)) {
                console.warn(
                    `Permission denied for action: ${permission}.`,
                );

                if (fallback) {
                    console.warn(`Executing fallback for: ${propertyKey}`);
                    return fallback(...args);
                }

                throw PermissionError.fromAction(
                    permission as ActionPermission,
                );
            }

            return await originalMethod.apply(this, args);
        }) as T;
    };
}
