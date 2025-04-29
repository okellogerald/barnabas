import { ActionPermission } from "@/managers/auth/permission";

/**
 * Represents an error thrown when a user lacks the necessary permissions.
 * This class extends the built-in Error class and includes information about
 * the required permissions.
 */
export class PermissionError extends Error {
    /**
     * An array of ActionPermission strings representing the permissions
     * required to perform the action that caused the error.
     */
    readonly requiredPermissions: ActionPermission[];

    /**
     * Constructs a new PermissionError instance.
     *
     * @param args An object containing the required permissions and an optional message.
     * @param args.requiredPermissions An array of ActionPermission strings.
     * @param args.message An optional custom error message.
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
     * Type guard to determine if an error is a PermissionError instance.
     *
     * @param error Any error value.
     * @returns True if the error is a PermissionError, false otherwise.
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
     * Returns a string representation of the PermissionError, including
     * the error name, message, and required permissions.
     *
     * @returns A string representation of the error.
     */
    toString(): string {
        return `${this.name}: ${this.message} [Required: ${
            this.requiredPermissions.join(", ")
        }]`;
    }

    /**
     * Creates a PermissionError from a single ActionPermission.
     * This method generates a user-friendly error message based on the action.
     *
     * @param action The required ActionPermission.
     * @param customMessage An optional custom error message.
     * @returns A new PermissionError instance.
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
     * Creates a PermissionError from an array of ActionPermissions.
     *
     * @param actions An array of required ActionPermissions.
     * @param customMessage An optional custom error message.
     * @returns A new PermissionError instance.
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
