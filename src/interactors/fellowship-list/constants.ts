/**
 * Constants related to Fellowship API operations
 */
export const FELLOWSHIP_API = {
    /** Standard eager loading path for fellowship list */
    EAGER_LOADING: "chairman,secretary,treasurer,deputyChairman",
    /** Eager loading with members count */
    EAGER_WITH_MEMBERS:
        "chairman,secretary,treasurer,deputyChairman,memberCount",
};

/**
 * Constants for fellowship UI elements
 */
export const FELLOWSHIP_UI = {
    /** Sorting options */
    SORTING: {
        /** Default field to sort by */
        DEFAULT_FIELD: "name",
        /** Available sort options with their display names */
        OPTIONS: {
            name: "Name",
            createdAt: "Creation Date",
        },
    },
};

/**
 * Notification messages for fellowship operations
 */
export const FELLOWSHIP_NOTIFICATIONS = {
    /** Fellowship list related notifications */
    LIST: {
        /** When refreshing the fellowship list */
        REFRESHING: "Refreshing fellowships...",
        /** When loading more fellowships during pagination */
        LOADING_MORE: "Loading more fellowships...",
    },
    /** Fellowship detail related notifications */
    DETAIL: {
        /** When loading fellowship details */
        LOADING: "Loading fellowship details...",
        /** When a fellowship is not found */
        NOT_FOUND: "Fellowship not found",
    },
    /** Fellowship creation related notifications */
    CREATE: {
        /** When creating a new fellowship */
        CREATING: "Creating new fellowship...",
        /** When a fellowship is successfully created */
        SUCCESS: "Fellowship created successfully",
        /** When fellowship creation fails */
        ERROR: "Failed to create fellowship",
    },
    /** Fellowship update related notifications */
    UPDATE: {
        /** When updating a fellowship */
        UPDATING: "Updating fellowship...",
        /** When a fellowship is successfully updated */
        SUCCESS: "Fellowship updated successfully",
        /** When fellowship update fails */
        ERROR: "Failed to update fellowship",
    },
    /** Fellowship deletion related notifications */
    DELETE: {
        /** When deleting a fellowship */
        DELETING: "Deleting fellowship...",
        /** When a fellowship is successfully deleted */
        SUCCESS: "Fellowship deleted successfully",
        /** When fellowship deletion fails */
        ERROR: "Failed to delete fellowship",
        /** Confirmation message before deletion */
        CONFIRM: "Are you sure you want to delete this fellowship?",
    },
};
