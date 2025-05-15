/**
 * Centralized query key definitions for the application
 *
 * Provides type-safe query key generators for each entity
 */

import { MemberQueryBuilder, MemberQueryCriteria } from "@/data/member/member.query-builder";

export const QueryKeys = {
  // Fellowship-related query keys
  Fellowships: {
    all: ["fellowships"] as const,
    count: () => [...QueryKeys.Fellowships.all, "count"] as const,
    list: () => [...QueryKeys.Fellowships.all, "list"] as const,
    detail: (id: string) =>
      [...QueryKeys.Fellowships.all, "detail", id] as const,
    leadership: () => [...QueryKeys.Fellowships.all, "leadership"] as const,
  },

  // Church-related query keys
  Churches: {
    all: ["churches"] as const,
    current: () => [...QueryKeys.Churches.all, "current"] as const,
    detail: (id: string) => [...QueryKeys.Churches.all, "detail", id] as const,
    stats: () => [...QueryKeys.Churches.all, "stats"] as const,
  },

  // Member-related query keys
  Members: {
    all: ["members"] as const,
    list: (params: MemberQueryBuilder | MemberQueryCriteria) =>
      [
        ...QueryKeys.Members.all,
        "list",
        MemberQueryBuilder.is(params) ? params.build() : params,
      ] as const,
    detail: (id: string) => [...QueryKeys.Members.all, "detail", id] as const,
    dependants: (memberId: string) =>
      [...QueryKeys.Members.all, "dependants", memberId] as const,
    count: () => [...QueryKeys.Members.all, "count"] as const,
  },

  // User-related query keys
  Users: {
    all: ["users"] as const,
    list: (params?: {
      searchTerm?: string;
      roleId?: string;
      isActive?: boolean;
      rangeStart?: number;
      rangeEnd?: number;
    }) => [...QueryKeys.Users.all, "list", params] as const,
    detail: (id: string) => [...QueryKeys.Users.all, "detail", id] as const,
    count: () => [...QueryKeys.Users.all, "count"] as const,
  },

  // Role-related query keys
  Roles: {
    all: ["roles"] as const,
    count: () => [...QueryKeys.Roles.all, "count"] as const,
    list: () => [...QueryKeys.Roles.all, "list"] as const,
    detail: (id: string) => [...QueryKeys.Roles.all, "detail", id] as const,
    permissions: (roleId: string) =>
      [...QueryKeys.Roles.all, "permissions", roleId] as const,
    actions: (roleId: string) =>
      [...QueryKeys.Roles.all, roleId, "actions"] as const,
  },

  // Volunteer-related query keys
  Volunteers: {
    all: ["volunteers"] as const,
    count: () => [...QueryKeys.Volunteers.all, "count"] as const,
    list: () => [...QueryKeys.Volunteers.all, "opportunities"] as const,
    opportunityDetail: (id: string) =>
      [...QueryKeys.Volunteers.all, "opportunityDetail", id] as const,
    interestedMembers: (opportunityId: string) =>
      [
        ...QueryKeys.Volunteers.all,
        "interestedMembers",
        opportunityId,
      ] as const,
  },

  // Envelope-related query keys
  Envelopes: {
    base: ["envelopes"] as const,
    list: () => [...QueryKeys.Envelopes.base, "list"] as const,
    count: () => [...QueryKeys.Envelopes.base, "count"] as const,
    detail: (id: string) =>
      [...QueryKeys.Envelopes.base, "detail", id] as const,
    byNumber: (number: number) =>
      [...QueryKeys.Envelopes.base, "byNumber", number] as const,
    available: () => [...QueryKeys.Envelopes.base, "available"] as const,
    history: (id: string) =>
      [...QueryKeys.Envelopes.base, "history", id] as const,
  },

  // Interest-related query keys
  Interests: {
    all: ["interests"] as const,
    list: () => [...QueryKeys.Interests.all, "list"] as const,
    count: () => [...QueryKeys.Interests.all, "count"] as const,
    detail: (id: string) => [...QueryKeys.Interests.all, "detail", id] as const,
    byMember: (memberId: string) =>
      [...QueryKeys.Interests.all, "byMember", memberId] as const,
    byOpportunity: (opportunityId: string) =>
      [...QueryKeys.Interests.all, "byOpportunity", opportunityId] as const,
  },
};
