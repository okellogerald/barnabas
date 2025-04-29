import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "./keys";

/**
 * Query utility functions for cache manipulation and invalidation
 * Provides type-safe methods for working with the query cache
 */
export const QueryUtils = (queryClient: QueryClient) => ({
    /**
     * Fellowship-related query utilities
     */
    Fellowships: {
        /**
         * Invalidate all fellowship-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.all,
            }),

        /**
         * Invalidate the fellowships list query
         */
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.list(),
            }),

        /**
         * Invalidate the fellowships count query
         */
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.count(),
            }),

        /**
         * Invalidate a specific fellowship detail query
         */
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.detail(id),
            }),

        /**
         * Invalidate members list for a specific fellowship
         */
        invalidateMembers: (fellowshipId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.members(fellowshipId),
            }),

        /**
         * Invalidate fellowship leadership queries
         */
        invalidateLeadership: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.leadership(),
            }),

        /**
         * Prefetch a specific fellowship's details
         * Useful for improving UX when navigating to a fellowship detail page
         */
        prefetchDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Fellowships.detail(id),
                queryFn: fetchFn,
            }),

        /**
         * Remove a specific fellowship from the cache
         * Useful after deletion
         */
        removeDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Fellowships.detail(id),
            }),
    },

    /**
     * Church-related query utilities
     */
    Churches: {
        /**
         * Invalidate all church-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: QueryKeys.Churches.all }),

        /**
         * Invalidate the current church query
         */
        invalidateCurrent: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.current(),
            }),

        /**
         * Invalidate a specific church detail query
         */
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.detail(id),
            }),

        /**
         * Invalidate church statistics query
         */
        invalidateStats: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.stats(),
            }),

        /**
         * Prefetch a specific church's details
         */
        prefetchDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Churches.detail(id),
                queryFn: fetchFn,
            }),
    },

    /**
     * Member-related query utilities
     */
    Members: {
        /**
         * Invalidate all member-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: QueryKeys.Members.all }),

        /**
         * Invalidate the members list query with optional filters
         */
        invalidateList: (
            params?: { fellowshipId?: string; searchTerm?: string },
        ) => {
            if (params) {
                queryClient.invalidateQueries({
                    queryKey: QueryKeys.Members.list(params),
                });
            } else {
                // Invalidate all list queries regardless of parameters
                queryClient.invalidateQueries({
                    queryKey: QueryKeys.Members.all,
                    predicate: (query) => {
                        if (
                            Array.isArray(query.queryKey) &&
                            query.queryKey[0] === "members"
                        ) {
                            return query.queryKey.length > 1 &&
                                query.queryKey[1] === "list";
                        }
                        return false;
                    },
                });
            }
        },

        /**
         * Invalidate member count query
         */
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.count(),
            }),

        /**
         * Invalidate a specific member detail query
         */
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.detail(id),
            }),

        /**
         * Invalidate dependants for a specific member
         */
        invalidateDependants: (memberId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.dependants(memberId),
            }),

        /**
         * Prefetch a specific member's details
         */
        prefetchDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Members.detail(id),
                queryFn: fetchFn,
            }),

        /**
         * Remove a specific member from the cache
         * Useful after deletion
         */
        removeDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Members.detail(id),
            }),
    },

    /**
     * User-related query utilities
     */
    Users: {
        /**
         * Invalidate all user-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: QueryKeys.Users.all }),

        /**
         * Invalidate the users list query with optional filters
         */
        invalidateList: (
            params?: { searchTerm?: string; roleId?: string; isActive?: boolean },
        ) => {
            if (params) {
                queryClient.invalidateQueries({
                    queryKey: QueryKeys.Users.list(params),
                });
            } else {
                // Invalidate all list queries regardless of parameters
                queryClient.invalidateQueries({
                    queryKey: QueryKeys.Users.all,
                    predicate: (query) => {
                        if (
                            Array.isArray(query.queryKey) &&
                            query.queryKey[0] === "users"
                        ) {
                            return query.queryKey.length > 1 &&
                                query.queryKey[1] === "list";
                        }
                        return false;
                    },
                });
            }
        },

        /**
         * Invalidate user count query
         */
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Users.count(),
            }),

        /**
         * Invalidate a specific user detail query
         */
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Users.detail(id),
            }),

        /**
         * Prefetch a specific user's details
         */
        prefetchDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Users.detail(id),
                queryFn: fetchFn,
            }),

        /**
         * Remove a specific user from the cache
         * Useful after deletion
         */
        removeDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Users.detail(id),
            }),
    },

    /**
     * Role-related query utilities
     */
    Roles: {
        /**
         * Invalidate all role-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: QueryKeys.Roles.all }),

        /**
         * Invalidate the roles list query
         */
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.list(),
            }),

        /**
         * Invalidate a specific role detail query
         */
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.detail(id),
            }),

        /**
         * Invalidate permissions for a specific role
         */
        invalidatePermissions: (roleId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.permissions(roleId),
            }),

        /**
         * Prefetch a specific role's details
         */
        prefetchDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Roles.detail(id),
                queryFn: fetchFn,
            }),

        /**
         * Remove a specific role from the cache
         */
        removeDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Roles.detail(id),
            }),
    },

    /**
     * Volunteer-related query utilities
     */
    Volunteers: {
        /**
         * Invalidate all volunteer-related queries
         */
        invalidateAll: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.all,
            }),

        /**
         * Invalidate the volunteer opportunities list query
         */
        invalidateOpportunities: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.opportunities(),
            }),

        /**
         * Invalidate a specific volunteer opportunity detail query
         */
        invalidateOpportunityDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.opportunityDetail(id),
            }),

        /**
         * Invalidate interested members for a specific opportunity
         */
        invalidateInterestedMembers: (opportunityId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.interestedMembers(opportunityId),
            }),

        /**
         * Prefetch a specific volunteer opportunity's details
         */
        prefetchOpportunityDetail: (id: string, fetchFn: () => Promise<any>) =>
            queryClient.prefetchQuery({
                queryKey: QueryKeys.Volunteers.opportunityDetail(id),
                queryFn: fetchFn,
            }),

        /**
         * Remove a specific volunteer opportunity from the cache
         */
        removeOpportunityDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Volunteers.opportunityDetail(id),
            }),
    },
});