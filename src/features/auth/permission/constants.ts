/**
 * Enum defining all resource types in the system
 */
export enum ResourceType {
    FELLOWSHIP = "fellowship",
    USER = "user",
    ROLE = "role",
    MEMBER = "member",
    OPPORTUNITY = "opportunity",
    ENVELOPE = "envelope",
    INTEREST = "interest",
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
 * Structured as ResourceType.ActionType or custom strings where necessary
 */
export const Actions = {
    // Fellowship actions
    FELLOWSHIP_CREATE: `${ResourceType.FELLOWSHIP}.${ActionType.CREATE}`,
    FELLOWSHIP_UPDATE: `${ResourceType.FELLOWSHIP}.${ActionType.UPDATE}`,
    FELLOWSHIP_DELETE: `${ResourceType.FELLOWSHIP}.${ActionType.DELETE}`,
    FELLOWSHIP_DELETE_BY_ID: `${ResourceType.FELLOWSHIP}.${ActionType.DELETE_BY_ID}`,
    FELLOWSHIP_FIND_ALL: `${ResourceType.FELLOWSHIP}.${ActionType.FIND_ALL}`,
    FELLOWSHIP_FIND_BY_ID: `${ResourceType.FELLOWSHIP}.${ActionType.FIND_BY_ID}`,

    // User actions
    USER_CREATE: `${ResourceType.USER}.${ActionType.CREATE}`,
    USER_UPDATE: `${ResourceType.USER}.${ActionType.UPDATE}`,
    USER_DELETE: `${ResourceType.USER}.${ActionType.DELETE}`,
    USER_DELETE_BY_ID: `${ResourceType.USER}.${ActionType.DELETE_BY_ID}`,
    USER_FIND_ALL: `${ResourceType.USER}.${ActionType.FIND_ALL}`,
    USER_FIND_BY_ID: `${ResourceType.USER}.${ActionType.FIND_BY_ID}`,

    // Role actions
    ROLE_CREATE: `${ResourceType.ROLE}.${ActionType.CREATE}`,
    ROLE_UPDATE: `${ResourceType.ROLE}.${ActionType.UPDATE}`,
    ROLE_DELETE: `${ResourceType.ROLE}.${ActionType.DELETE}`,
    ROLE_DELETE_BY_ID: `${ResourceType.ROLE}.${ActionType.DELETE_BY_ID}`,
    ROLE_FIND_ALL: `${ResourceType.ROLE}.${ActionType.FIND_ALL}`,
    ROLE_FIND_BY_ID: `${ResourceType.ROLE}.${ActionType.FIND_BY_ID}`,

    // Member actions
    MEMBER_CREATE: `${ResourceType.MEMBER}.${ActionType.CREATE}`,
    MEMBER_UPDATE: `${ResourceType.MEMBER}.${ActionType.UPDATE}`,
    MEMBER_DELETE: `${ResourceType.MEMBER}.${ActionType.DELETE}`,
    MEMBER_DELETE_BY_ID: `${ResourceType.MEMBER}.${ActionType.DELETE_BY_ID}`,
    MEMBER_FIND_ALL: `${ResourceType.MEMBER}.${ActionType.FIND_ALL}`,
    MEMBER_FIND_BY_ID: `${ResourceType.MEMBER}.${ActionType.FIND_BY_ID}`,

    // Opportunity actions
    OPPORTUNITY_CREATE: `${ResourceType.OPPORTUNITY}.${ActionType.CREATE}`,
    OPPORTUNITY_UPDATE: `${ResourceType.OPPORTUNITY}.${ActionType.UPDATE}`,
    OPPORTUNITY_DELETE: `${ResourceType.OPPORTUNITY}.${ActionType.DELETE}`,
    OPPORTUNITY_DELETE_BY_ID: `${ResourceType.OPPORTUNITY}.${ActionType.DELETE_BY_ID}`,
    OPPORTUNITY_FIND_ALL: `${ResourceType.OPPORTUNITY}.${ActionType.FIND_ALL}`,
    OPPORTUNITY_FIND_BY_ID: `${ResourceType.OPPORTUNITY}.${ActionType.FIND_BY_ID}`,

    // Interest actions
    INTEREST_FIND_ALL: `${ResourceType.INTEREST}.${ActionType.FIND_ALL}`,

    // Envelope actions (including custom ones)
    ENVELOPE_CREATE: `${ResourceType.ENVELOPE}.${ActionType.CREATE}`,
    ENVELOPE_UPDATE: `${ResourceType.ENVELOPE}.${ActionType.UPDATE}`,
    ENVELOPE_DELETE: `${ResourceType.ENVELOPE}.${ActionType.DELETE}`,
    ENVELOPE_FIND_ALL: `${ResourceType.ENVELOPE}.${ActionType.FIND_ALL}`,
    ENVELOPE_FIND_BY_ID: `${ResourceType.ENVELOPE}.${ActionType.FIND_BY_ID}`,
    ENVELOPE_FIND_BY_NUMBER: "envelope.findByNumber",
    ENVELOPE_FIND_AVAILABLE: "envelope.findAvailable",
    ENVELOPE_ASSIGN: "envelope.assign",
    ENVELOPE_RELEASE: "envelope.release",
    ENVELOPE_GET_HISTORY: "envelope.getHistory",
} as const;

/**
 * Type representing a valid permission action string
 */
export type ActionPermission = typeof Actions[keyof typeof Actions];
