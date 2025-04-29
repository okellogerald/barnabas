import { useQuery } from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query";
import { queryClient, QueryKeys } from "@/lib/query";
import { RoleQueryParams } from "@/data/role";
import { Role } from "@/models";
import { RoleManager } from "@/managers/role";

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

    // /**
    //  * Hook to fetch permissions for a role
    //  * @param {string} roleId The role ID
    //  * @returns {UseQueryResult<string[], Error>} Query result with permissions list
    //  */
    // usePermissions: (roleId: string): UseQueryResult<string[], Error> =>
    //     useQuery({
    //         queryKey: QueryKeys.Roles.permissions(roleId),
    //         queryFn: async () => {
    //             return roleManager.getRolePermissions(roleId);
    //         },
    //         enabled: !!roleId,
    //     }),

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
    // /**
    //  * Hook for creating a new role
    //  * @returns {UseMutationResult<Role, Error, CreateRoleDTO, unknown>} Mutation result
    //  */
    // useCreate: (): UseMutationResult<Role, Error, CreateRoleDTO, unknown> =>
    //     useMutation({
    //         mutationFn: async (data: CreateRoleDTO) => {
    //             return roleManager.createRole(data);
    //         },
    //         onSuccess: () => {
    //             // Invalidate relevant queries
    //             Query.Roles.invalidateList();
    //             Query.Roles.invalidateCount();
    //         },
    //     }),

    // /**
    //  * Hook for updating an existing role
    //  * @returns {UseMutationResult<Role, Error, {id: string, data: UpdateRoleDTO}, unknown>} Mutation result
    //  */
    // useUpdate: (): UseMutationResult<
    //     Role,
    //     Error,
    //     { id: string; data: UpdateRoleDTO },
    //     unknown
    // > => useMutation({
    //     mutationFn: async (
    //         { id, data }: { id: string; data: UpdateRoleDTO },
    //     ) => {
    //         return roleManager.updateRole(id, data);
    //     },
    //     onSuccess: (updatedRole) => {
    //         // Update the detail cache
    //         queryClient.setQueryData(
    //             QueryKeys.Roles.detail(updatedRole.id),
    //             updatedRole,
    //         );

    //         // Invalidate lists
    //         Query.Roles.invalidateList();
    //     },
    // }),

    // /**
    //  * Hook for updating role permissions
    //  * @returns {UseMutationResult<string[], Error, {roleId: string, permissions: string[]}, unknown>} Mutation result
    //  */
    // useUpdatePermissions: (): UseMutationResult<
    //     string[],
    //     Error,
    //     { roleId: string; permissions: string[] },
    //     unknown
    // > => useMutation({
    //     mutationFn: async (
    //         { roleId, permissions }: { roleId: string; permissions: string[] },
    //     ) => {
    //         return roleManager.updateRolePermissions(roleId, permissions);
    //     },
    //     onSuccess: (_, variables) => {
    //         // Update the permissions cache
    //         queryClient.setQueryData(
    //             QueryKeys.Roles.permissions(variables.roleId),
    //             variables.permissions,
    //         );

    //         // Invalidate role detail as permissions may affect it
    //         Query.Roles.invalidateDetail(variables.roleId);

    //         // Invalidate any auth queries since permissions changed
    //         queryClient.invalidateQueries({ queryKey: ["auth"] });
    //     },
    // }),

    // /**
    //  * Hook for deleting a role
    //  * @returns {UseMutationResult<void, Error, string, unknown>} Mutation result
    //  */
    // useDelete: (): UseMutationResult<void, Error, string, unknown> =>
    //     useMutation({
    //         mutationFn: (id: string) => roleManager.deleteRole(id),
    //         onSuccess: (_, deletedId) => {
    //             // Remove from cache
    //             Query.Roles.removeDetail(deletedId);

    //             // Invalidate lists and counts
    //             Query.Roles.invalidateList();
    //             Query.Roles.invalidateCount();

    //             // Since users might reference this role, invalidate user queries too
    //             Query.Users.invalidateList();
    //         },
    //     }),
};
