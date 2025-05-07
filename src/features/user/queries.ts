import { useMutation, useQuery } from "@tanstack/react-query";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserQueryParams,
  UserRepository,
} from "@/data/user";
import { User } from "@/models";
import { UserManager } from "@/features/user";

// Create a repository instance
const userManager = UserManager.instance;

/**
 * User query hooks for data fetching and mutations
 * Provides a central place for all user-related data operations
 */
export const UserQueries = {
  /**
   * Hook to fetch a list of users with optional filtering and pagination
   * @param {UserQueryParams} params Optional parameters for filtering and pagination
   * @returns {UseQueryResult<{users: User[], total: number}, Error>} Query result with users and total
   */
  useList: (
    params?: Partial<UserQueryParams>,
  ): UseQueryResult<{ users: User[]; total: number }, Error> =>
    useQuery({
      queryKey: [QueryKeys.Users.list(), params],
      queryFn: async () => {
        const _params: UserQueryParams = {
          ...UserRepository.defaultQueryParams,
          ...params,
        };

        return await userManager.getUsers(_params);
      },
    }),

  /**
   * Hook to get the total count of users with optional filters
   * @param {Partial<UserQueryParams>} filters Optional filters to apply
   * @returns {UseQueryResult<number, Error>} Query result with the total count
   */
  useCount: (
    filters?: Partial<UserQueryParams>,
  ): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: [QueryKeys.Users.count(), filters],
      queryFn: async () => {
        return userManager.getUsersCount(filters);
      },
    }),

  /**
   * Hook to fetch a single user by ID
   * @param {string} id The user ID
   * @returns {UseQueryResult<User, Error>} Query result with user details
   */
  useDetail: (id: string): UseQueryResult<User, Error> =>
    useQuery({
      queryKey: QueryKeys.Users.detail(id),
      queryFn: async () => {
        const user = await userManager.getUserById(id);
        if (!user) {
          throw new Error(`User with ID ${id} not found`);
        }
        return user;
      },
      enabled: !!id,
    }),

  /**
   * Prefetch a user's details
   * @param {string} id The user ID to prefetch
   * @returns {Promise<void>} Promise that resolves when prefetching is complete
   */
  prefetchDetail: (id: string): Promise<void> =>
    queryClient.prefetchQuery({
      queryKey: QueryKeys.Users.detail(id),
      queryFn: async () => {
        const user = await userManager.getUserById(id);
        return user || null;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  /**
   * Hook for creating a new user
   * @returns {UseMutationResult<User, Error, CreateUserDTO, unknown>} Mutation result
   */
  useCreate: (): UseMutationResult<User, Error, CreateUserDTO, unknown> =>
    useMutation({
      mutationFn: async (data: CreateUserDTO) => {
        return userManager.createUser(data);
      },
      onSuccess: () => {
        // Invalidate relevant queries
        Query.Users.invalidateList();
        Query.Users.invalidateCount();
      },
    }),

  /**
   * Hook for updating an existing user
   * @returns {UseMutationResult<User, Error, {id: string, data: UpdateUserDTO}, unknown>} Mutation result
   */
  useUpdate: (): UseMutationResult<
    User,
    Error,
    { id: string; data: UpdateUserDTO },
    unknown
  > =>
    useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateUserDTO }) => {
        return userManager.updateUser(id, data);
      },
      onSuccess: (updatedUser) => {
        // Update the detail cache
        queryClient.setQueryData(
          QueryKeys.Users.detail(updatedUser.id),
          updatedUser,
        );

        // Invalidate lists
        Query.Users.invalidateList();
      },
    }),

  /**
   * Hook for deleting a user
   * @returns {UseMutationResult<void, Error, string, unknown>} Mutation result
   */
  useDelete: (): UseMutationResult<void, Error, string, unknown> =>
    useMutation({
      mutationFn: (id: string) => userManager.deleteUser(id),
      onSuccess: (_, deletedId) => {
        // Remove from cache
        Query.Users.removeDetail(deletedId);

        // Invalidate lists and counts
        Query.Users.invalidateList();
        Query.Users.invalidateCount();
      },
    }),
};
