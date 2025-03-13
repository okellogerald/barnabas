/**
 * Error categories for consistent error handling
 */
export enum ErrorCategory {
    FETCH = "fetch",
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    AUTH = "authentication",
    PERMISSION = "permission",
    VALIDATION = "validation",
    NOT_FOUND = "not_found",
    NETWORK = "network",
    UNKNOWN = "unknown",
}

/**
 * Context object for additional error information
 */
export interface ErrorContext {
    entity?: string; // The entity being operated on
    operation?: string; // Specific operation
    details?: any; // Any additional details that might help debugging
}
