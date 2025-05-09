/**
 * Centralized query key definitions for the application
 * Provides type-safe query key generators for each entity
 */
export const QueryKeys = {
    // Fellowship-related query keys
    Fellowships: {
        all: ["fellowships"] as const,
        count: () => [...QueryKeys.Fellowships.all, "count"] as const,
        list: () => [...QueryKeys.Fellowships.all, "list"] as const,
        detail: (id: string) =>
            [...QueryKeys.Fellowships.all, "detail", id] as const,
        members: (fellowshipId: string) =>
            [...QueryKeys.Fellowships.all, "members", fellowshipId] as const,
        leadership: () => [...QueryKeys.Fellowships.all, "leadership"] as const,
    },

    // Church-related query keys
    Churches: {
        all: ["churches"] as const,
        current: () => [...QueryKeys.Churches.all, "current"] as const,
        detail: (id: string) =>
            [...QueryKeys.Churches.all, "detail", id] as const,
        stats: () => [...QueryKeys.Churches.all, "stats"] as const,
    },

    // Member-related query keys
    Members: {
        all: ["members"] as const,
        list: (params?: {
            fellowshipId?: string;
            searchTerm?: string;
            rangeStart?: number;
            rangeEnd?: number;
        }) => [...QueryKeys.Members.all, "list", params] as const,
        detail: (id: string) =>
            [...QueryKeys.Members.all, "detail", id] as const,
        dependants: (memberId: string) =>
            [...QueryKeys.Members.all, "dependants", memberId] as const,
        count: () => [...QueryKeys.Members.all, "count"] as const,
    },

    // Role-related query keys
    Roles: {
        all: ["roles"] as const,
        list: () => [...QueryKeys.Roles.all, "list"] as const,
        detail: (id: string) => [...QueryKeys.Roles.all, "detail", id] as const,
        permissions: (roleId: string) =>
            [...QueryKeys.Roles.all, "permissions", roleId] as const,
    },

    // Volunteer-related query keys
    Volunteers: {
        all: ["volunteers"] as const,
        opportunities: () =>
            [...QueryKeys.Volunteers.all, "opportunities"] as const,
        opportunityDetail: (id: string) =>
            [...QueryKeys.Volunteers.all, "opportunityDetail", id] as const,
        interestedMembers: (opportunityId: string) =>
            [
                ...QueryKeys.Volunteers.all,
                "interestedMembers",
                opportunityId,
            ] as const,
    },
};
