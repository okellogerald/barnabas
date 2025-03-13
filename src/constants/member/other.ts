export const MEMBER_NOTIFICATIONS = {
    LIST: {
        LOADING: "Loading members...",
        REFRESHING: "Refreshing members...",
        LOADING_MORE: "Loading more data...",
        ERROR_FETCH: "Failed to load members",
        ERROR_REFRESH: "Failed to refresh members",
        ERROR_PAGINATION: "Failed to load more data",
    },
    CREATE: {
        SUCCESS: "Member created successfully",
        ERROR: "Failed to create member",
        VALIDATION: "Please fix the validation errors",
    },
    EDIT: {
        SUCCESS: "Member updated successfully",
        ERROR: "Failed to update member",
        LOADING: "Loading member details...",
    },
    DELETE: {
        CONFIRM: "Are you sure you want to delete this member?",
        SUCCESS: "Member deleted successfully",
        ERROR: "Failed to delete member",
    },
};

export const MEMBER_UI = {
    // Used for display/rendering
    ROLES: {
        REGULAR: "Regular",
        LEADER: "Leader",
        CLERGY: "Clergy",
        STAFF: "Staff",
        VOLUNTEER: "Volunteer",
    },
    SORTING: {
        DEFAULT_FIELD: "firstName",
        DEFAULT_DIRECTION: "asc",
    },
    FIELDS: {
        REQUIRED: ["firstName", "lastName", "gender"],
        CONDITIONAL: {
            MARRIAGE: ["spouseName", "dateOfMarriage"],
        },
    },
};

export const MEMBER_API = {
    EAGER_LOADING: "fellowship", // Default relationships to include
    DEFAULT_ORDER_BY: "firstName",
    FILTERS: {
        BOOLEAN_TRUE: 1,
        BOOLEAN_FALSE: 0,
    },
};
