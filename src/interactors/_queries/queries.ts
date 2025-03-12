import { queryClient } from "@/app";

export const QueryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    users: {
        all: ["users"] as const,
        detail: (id: string) => ["users", id] as const,
    },
    church: {
        me: ["church", "me"] as const,
    },
    fellowships: {
        all: ["fellowships"] as const,
        detail: (id: string) => ["fellowships", id] as const,
    },
    members: {
        all: ["members"] as const,
        detail: (id: string) => ["members", id] as const,
    },
    opportunities: {
        all: ["opportunities"] as const,
        detail: (id: string) => ["opportunities", id] as const,
    },
    roles: {
        all: ["roles"] as const,
        detail: (id: string) => ["roles", id] as const,
    },
} as const;

export const InvalidationActions = {
    refreshUsers: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.users.all });
    },
    refreshUser: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.users.detail(id),
        });
    },
    refreshCurrentUser: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.auth.me });
    },
    refreshChurch: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.church.me });
    },
    refreshFellowships: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.fellowships.all });
    },
    refreshFellowship: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.fellowships.detail(id),
        });
    },
    refreshMembers: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.members.all });
    },
    refreshMember: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.members.detail(id),
        });
    },
    refreshOpportunities: () => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.opportunities.all,
        });
    },
    refreshOpportunity: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.opportunities.detail(id),
        });
    },
    refreshRoles: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.roles.all });
    },
    refreshRole: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.roles.detail(id),
        });
    },
    refreshAll: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.users.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.fellowships.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.members.all });
        queryClient.invalidateQueries({
            queryKey: QueryKeys.opportunities.all,
        });
        queryClient.invalidateQueries({ queryKey: QueryKeys.roles.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.auth.me });
        queryClient.invalidateQueries({ queryKey: QueryKeys.church.me });
    },
} as const;
