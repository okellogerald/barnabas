import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "./query.keys";

/**
 * Query utility functions for cache manipulation and invalidation
 * Provides type-safe methods for working with the query cache
 */
export const QueryUtils = (queryClient: QueryClient) => ({
    // Fellowship query utilities
    Fellowships: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.list(),
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.count(),
                exact: false,
            }),
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.detail(id),
            }),
        removeDetail: (id: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Fellowships.detail(id),
            }),
        invalidateLeadership: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Fellowships.leadership(),
            }),
    },

    // Church query utilities
    Churches: {
        invalidateCurrent: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.current(),
            }),
        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.detail(id),
            }),
        invalidateStats: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Churches.stats(),
            }),
    },

    // Member query utilities
    Members: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.all,
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.count(),
            }),
        invalidateDetail: (memberId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.detail(memberId),
            }),
        removeDetail: (memberId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Members.detail(memberId),
            }),
        invalidateDependants: (memberId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Members.dependants(memberId),
            }),
    },

    // User query utilities
    Users: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Users.all,
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Users.count(),
                exact: false,
            }),
        invalidateDetail: (userId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Users.detail(userId),
            }),
        removeDetail: (userId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Users.detail(userId),
            }),
    },

    // Role query utilities
    Roles: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.list(),
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.count(),
                exact: false,
            }),
        invalidateDetail: (roleId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.detail(roleId),
            }),
        invalidatePermissions: (roleId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.permissions(roleId),
            }),
        invalidateActions: (roleId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Roles.actions(roleId),
            }),
        removeDetail: (roleId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Roles.detail(roleId),
            }),
    },

    // Volunteer opportunity query utilities
    VolunteerOpportunities: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.list(),
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.count(),
                exact: false,
            }),
        invalidateDetail: (opportunityId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.opportunityDetail(opportunityId),
            }),
        removeDetail: (opportunityId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Volunteers.opportunityDetail(opportunityId),
            }),
        invalidateInterestedMembers: (opportunityId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Volunteers.interestedMembers(opportunityId),
            }),
    },

    // Envelope query utilities
    Envelopes: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.list(),
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.count(),
                exact: false,
            }),
        invalidateDetail: (envelopeId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.detail(envelopeId),
            }),
        removeDetail: (envelopeId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Envelopes.detail(envelopeId),
            }),
        invalidateByNumber: (number: number) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.byNumber(number),
            }),
        invalidateAvailable: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.available(),
            }),
        invalidateHistory: (envelopeId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Envelopes.history(envelopeId),
            }),
    },

    // Interest query utilities
    Interests: {
        invalidateList: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Interests.list(),
                exact: false,
            }),
        invalidateCount: () =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Interests.count(),
                exact: false,
            }),
        invalidateDetail: (interestId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Interests.detail(interestId),
            }),
        removeDetail: (interestId: string) =>
            queryClient.removeQueries({
                queryKey: QueryKeys.Interests.detail(interestId),
            }),
        invalidateByMember: (memberId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Interests.byMember(memberId),
            }),
        invalidateByOpportunity: (opportunityId: string) =>
            queryClient.invalidateQueries({
                queryKey: QueryKeys.Interests.byOpportunity(opportunityId),
            }),
    },
});
