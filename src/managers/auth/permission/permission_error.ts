import { ActionPermission } from "./constants";

/**
 * Custom error class representing an error caused by missing required permissions.
 * Extends the built-in {@link Error} class to include the `requiredPermissions` property.
 *
 * @example
 * ```typescript
 * // Throw a permission error when user lacks required permissions
 * throw new PermissionError({
 *   requiredPermissions: [Actions.USER_CREATE, Actions.USER_UPDATE],
 *   message: "You cannot manage users without proper permissions"
 * });
 *
 * // Or use the factory method for a simpler approach
 * throw PermissionError.fromAction(Actions.MEMBER_CREATE);
 * ```
 */
export class PermissionError extends Error {
    /**
     * The permissions that are required but were not present, causing the error.
     * @type {ActionPermission[]}
     */
    readonly requiredPermissions: ActionPermission[];

    /**
     * Creates a new `PermissionError` instance.
     *
     * @param {Object} args - The constructor arguments.
     * @param {ActionPermission[]} args.requiredPermissions - An array of permissions required for the operation.
     * @param {string} [args.message] - An optional custom error message. Defaults to listing the missing permissions.
     */
    constructor(args: {
        requiredPermissions: ActionPermission[];
        message?: string;
    }) {
        const defaultMessage = `Missing required permissions: ${
            args.requiredPermissions.join(", ")
        }`;
        super(args.message || defaultMessage);

        this.requiredPermissions = args.requiredPermissions;
        this.name = "PermissionError";

        // Fix prototype chain for proper instanceof checks in TypeScript
        Object.setPrototypeOf(this, PermissionError.prototype);
    }

    /**
     * Validates if an unknown value is a valid PermissionError instance.
     * Performs structural validation of the error object and its properties.
     *
     * @param {unknown} error - The value to validate.
     * @returns {error is PermissionError} Type predicate indicating if the value is a valid PermissionError.
     */
    static is(error: unknown): error is PermissionError {
        // Basic type check
        if (!(error instanceof Error)) {
            return false;
        }

        // Name check
        if (error.name !== "PermissionError") {
            return false;
        }

        // Check for requiredPermissions property and validate it's an array
        const permError = error as any;
        if (!Array.isArray(permError.requiredPermissions)) {
            return false;
        }

        // Validate all items in requiredPermissions are strings
        if (
            !permError.requiredPermissions.every((p: any) =>
                typeof p === "string"
            )
        ) {
            return false;
        }

        // Passed all checks
        return true;
    }

    /**
     * Returns a formatted string representation of this error, including the list
     * of required permissions that were missing.
     *
     * @returns {string} A formatted error message
     */
    toString(): string {
        return `${this.name}: ${this.message} [Required: ${
            this.requiredPermissions.join(", ")
        }]`;
    }

    /**
     * Creates a PermissionError for a specific action permission.
     *
     * @param {ActionPermission} action - The action permission that is required
     * @param {string} [customMessage] - Optional custom error message
     * @returns {PermissionError} A configured permission error
     *
     * @example
     * ```typescript
     * throw PermissionError.fromAction(Actions.MEMBER_CREATE);
     * ```
     */
    static fromAction(
        action: ActionPermission,
        customMessage?: string,
    ): PermissionError {
        // Extract resource and action parts for a more descriptive default message
        const [resource, actionType] = action.split(".");
        const readableAction = actionType.toLowerCase().replace(
            /([A-Z])/g,
            " $1",
        ).trim();
        const message = customMessage ||
            `You don't have permission to ${readableAction} ${resource}`;

        return new PermissionError({
            requiredPermissions: [action],
            message,
        });
    }

    /**
     * Creates a PermissionError for multiple action permissions.
     *
     * @param {ActionPermission[]} actions - The action permissions that are required
     * @param {string} [customMessage] - Optional custom error message
     * @returns {PermissionError} A configured permission error
     *
     * @example
     * ```typescript
     * throw PermissionError.fromActions([
     *   Actions.MEMBER_CREATE,
     *   Actions.MEMBER_UPDATE
     * ]);
     * ```
     */
    static fromActions(
        actions: ActionPermission[],
        customMessage?: string,
    ): PermissionError {
        return new PermissionError({
            requiredPermissions: actions,
            message: customMessage ||
                `Missing required permissions: ${actions.join(", ")}`,
        });
    }
}
