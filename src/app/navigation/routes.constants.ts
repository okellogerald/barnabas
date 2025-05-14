/**
 * Route path constants
 * Using constants for route paths helps maintain consistency
 * and makes it easier to update paths across the application
 */
export const ROUTES = {
    ROOT: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    MEMBERS: {
        LIST: "/members",
        DETAILS: "/members/:id",
        CREATE: "/members/create",
        EDIT: "/members/edit/:id",
        ASSIGN_ENVELOPE: "/members/:id/assign-envelope",
    },
    FELLOWSHIPS: {
        LIST: "/fellowships",
        DETAILS: "/fellowships/:id",
        CREATE: "/fellowships/create",
        EDIT: "/fellowships/edit/:id",
    },
    OPPORTUNITIES: {
        LIST: "/opportunities",
        DETAILS: "/opportunities/:id",
        CREATE: "/opportunities/create",
        EDIT: "/opportunities/edit/:id",
    },
    ROLES: {
        LIST: "/roles",
        DETAILS: "/roles/:id",
        CREATE: "/roles/create",
        EDIT: "/roles/edit/:id",
    },
    USERS: {
        LIST: "/users",
        DETAILS: "/users/:id",
        CREATE: "/users/create",
        EDIT: "/users/edit/:id",
    },
    ENVELOPES: {
        LIST: "/envelopes",
        DETAILS: "/envelopes/:id",
        ASSIGN: "/envelopes/:id/assign",
    },
} as const;
