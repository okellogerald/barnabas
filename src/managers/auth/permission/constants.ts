/**
 * Enum defining all resource types in the system
 */
export enum ResourceType {
    FELLOWSHIP = "fellowship",
    USER = "user",
    ROLE = "role",
    MEMBER = "member",
}

/**
 * Enum defining all possible action types
 */
export enum ActionType {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    DELETE_BY_ID = "deleteById",
    FIND_ALL = "findAll",
    FIND_BY_ID = "findById",
}

/**
 * Constant object containing all possible permission actions
 * Structured as ResourceType.ActionType
 */
export const Actions = {
    // Fellowship actions
    FELLOWSHIP_CREATE: `${ResourceType.FELLOWSHIP}.${ActionType.CREATE}`,
    FELLOWSHIP_UPDATE: `${ResourceType.FELLOWSHIP}.${ActionType.UPDATE}`,
    FELLOWSHIP_FIND_ALL: `${ResourceType.FELLOWSHIP}.${ActionType.FIND_ALL}`,
    FELLOWSHIP_FIND_BY_ID:
        `${ResourceType.FELLOWSHIP}.${ActionType.FIND_BY_ID}`,
    FELLOWSHIP_DELETE_BY_ID:
        `${ResourceType.FELLOWSHIP}.${ActionType.DELETE_BY_ID}`,

    // User actions
    USER_CREATE: `${ResourceType.USER}.${ActionType.CREATE}`,
    USER_UPDATE: `${ResourceType.USER}.${ActionType.UPDATE}`,
    USER_DELETE: `${ResourceType.USER}.${ActionType.DELETE}`,
    USER_FIND_ALL: `${ResourceType.USER}.${ActionType.FIND_ALL}`,
    USER_FIND_BY_ID: `${ResourceType.USER}.${ActionType.FIND_BY_ID}`,

    // Role actions
    ROLE_FIND_ALL: `${ResourceType.ROLE}.${ActionType.FIND_ALL}`,
    ROLE_FIND_BY_ID: `${ResourceType.ROLE}.${ActionType.FIND_BY_ID}`,

    // Member actions
    MEMBER_CREATE: `${ResourceType.MEMBER}.${ActionType.CREATE}`,
    MEMBER_UPDATE: `${ResourceType.MEMBER}.${ActionType.UPDATE}`,
    MEMBER_DELETE_BY_ID: `${ResourceType.MEMBER}.${ActionType.DELETE_BY_ID}`,
    MEMBER_FIND_ALL: `${ResourceType.MEMBER}.${ActionType.FIND_ALL}`,
    MEMBER_FIND_BY_ID: `${ResourceType.MEMBER}.${ActionType.FIND_BY_ID}`,
} as const;

// Type representing a valid permission action string
export type ActionPermission = typeof Actions[keyof typeof Actions];
