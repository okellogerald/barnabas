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
    },
} as const;
