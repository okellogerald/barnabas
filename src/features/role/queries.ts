import { useQuery } from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query";
import { queryClient, QueryKeys } from "@/lib/query";
import { RoleQueryParams } from "@/data/role";
import { Role, RoleAction } from "@/models";
import { RoleManager } from "@/features/role/manager";

// Create a repository instance
const roleManager = RoleManager.instance;

/**
 * Role query hooks for data fetching and mutations
 * Provides a central place for all role-related data operations
 */
export const RoleQueries = {
    /**
     * Hook to fetch a list of roles with optional filtering and pagination
     * @param {RoleQueryParams} params Optional parameters for filtering and pagination
     * @returns {UseQueryResult<{roles: Role[], total: number}, Error>} Query result with roles and total
     */
    useList: (
        params?: Record<string, any>,
    ): UseQueryResult<{ roles: Role[]; total: number }, Error> =>
        useQuery({
            queryKey: [QueryKeys.Roles.list(), params],
            queryFn: async () => {
                const _params: RoleQueryParams = {
                    ...params,
                    rangeStart: params?.rangeStart || 0,
                    rangeEnd: params?.rangeEnd || 49, // Roles are typically fewer, so we can load more
                };

                return await roleManager.getRoles(_params);
            },
        }),

    /**
     * Hook to get the total count of roles with optional filters
     * @param {Partial<RoleQueryParams>} filters Optional filters to apply
     * @returns {UseQueryResult<number, Error>} Query result with the total count
     */
    useCount: (
        filters?: Partial<RoleQueryParams>,
    ): UseQueryResult<number, Error> =>
        useQuery({
            queryKey: [QueryKeys.Roles.count(), filters],
            queryFn: async () => {
                return roleManager.getRolesCount(filters);
            },
        }),

    /**
     * Hook to fetch a single role by ID
     * @param {string} id The role ID
     * @returns {UseQueryResult<Role, Error>} Query result with role details
     */
    useDetail: (id: string): UseQueryResult<Role, Error> =>
        useQuery({
            queryKey: QueryKeys.Roles.detail(id),
            queryFn: async () => {
                const role = await roleManager.getRoleById(id);
                if (!role) {
                    throw new Error(`Role with ID ${id} not found`);
                }
                return role;
            },
            enabled: !!id,
        }),

    /**
     * Prefetch a role's details
     * @param {string} id The role ID to prefetch
     * @returns {Promise<void>} Promise that resolves when prefetching is complete
     */
    prefetchDetail: (id: string): Promise<void> =>
        queryClient.prefetchQuery({
            queryKey: QueryKeys.Roles.detail(id),
            queryFn: async () => {
                const role = await roleManager.getRoleById(id);
                return role || null;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),

    /**
     * Hook to fetch actions for a role
     * @param {string} roleId The role ID
     * @param {object} options Optional query configuration
     * @returns {UseQueryResult<string[], Error>} Query result with actions list
     */
    useActions: (roleId: string): UseQueryResult<RoleAction[], Error> =>
        useQuery({
            queryKey: QueryKeys.Roles.actions(roleId),
            queryFn: async () => {
                return roleManager.getRoleActions(roleId);
            },
            enabled: !!roleId,
        }),
};
