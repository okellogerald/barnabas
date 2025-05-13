import { useCallback, useMemo } from "react";
import { TableProps } from "antd";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { User } from "@/models";
import { Navigation } from "@/app";
import { useUserFilterStore } from "./use-filter-store";
import { SortDirection } from "@/lib/query";
import { RoleQueries } from "@/data/role/role.queries";
import { UserQueries } from "@/data/user/user.queries";

// Custom success state for the users list
export class UsersListSuccessState
    extends SuccessState<{ users: User[]; total: number }> {
    readonly tableProps: TableProps<User>;
    readonly filters: {
        name?: string;
        email?: string;
        roleId?: string;
        isActive?: boolean;
        sortBy?: string;
        sortDirection?: SortDirection;
    };
    readonly pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number) => void;
    };
    readonly loading: boolean;
    readonly roles: { id: string; name: string }[];

    constructor(args: {
        data: { users: User[]; total: number };
        tableProps: TableProps<User>;
        filters: {
            name?: string;
            email?: string;
            roleId?: string;
            isActive?: boolean;
            sortBy?: string;
            sortDirection?: SortDirection;
        };
        pagination: {
            current: number;
            pageSize: number;
            total: number;
            onChange: (page: number) => void;
        };
        loading: boolean;
        roles: { id: string; name: string }[];
        actions: {
            refresh: () => void;
            updateFilters: (filters: any) => void;
            clearFilters: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.tableProps = args.tableProps;
        this.filters = args.filters;
        this.pagination = args.pagination;
        this.loading = args.loading;
        this.roles = args.roles;
        this._updateFilters = args.actions.updateFilters;
        this._clearFilters = args.actions.clearFilters;
    }

    private _updateFilters: (filters: any) => void;
    private _clearFilters: () => void;

    updateFilters(filters: any): void {
        this._updateFilters(filters);
    }

    clearFilters(): void {
        this._clearFilters();
    }

    static is(state: any): state is UsersListSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "tableProps" in state &&
            "filters" in state &&
            "pagination" in state &&
            "roles" in state
        );
    }
}

// Create table columns for users
const createTableColumns = () => {
    return [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
            render: (_, user) => user.displayName,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            key: "role",
            dataIndex: "role",
            render: (_, user) => user.role?.name,
        },
        {
            title: "Status",
            key: "status",
            dataIndex: "isActive",
            render: (_, user) => user.isAdmin,
        },
    ] as TableProps<User>["columns"];
};

// Main hook for user list
export const useUsersList = () => {
    // Get filter state from Zustand
    const {
        filters,
        pageSize,
        currentPage,
        setFilters,
        resetFilters,
        setCurrentPage,
    } = useUserFilterStore();

    // Fetch roles for filtering
    const rolesQuery = RoleQueries.useList({
        orderBy: "name",
    });

    // Convert filters to API query params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            rangeStart: (currentPage - 1) * pageSize,
            rangeEnd: (currentPage * pageSize) - 1,
        };

        // Name search
        if (filters.name) {
            params["name:like"] = `%${filters.name}%`;
        }

        // Email search
        if (filters.email) {
            params["email:like"] = `%${filters.email}%`;
        }

        // Role filter
        if (filters.roleId) {
            params.roleId = filters.roleId;
        }

        // Active status filter
        if (filters.isActive !== undefined) {
            params.isActive = filters.isActive ? 1 : 0;
        }

        // Sorting
        if (filters.sortBy) {
            if (filters.sortDirection === SortDirection.ASC) {
                params.orderBy = filters.sortBy;
            } else {
                params.orderByDesc = filters.sortBy;
            }
        } else {
            // Default sorting
            params.orderBy = "name";
        }

        return params;
    }, [filters, currentPage, pageSize]);

    // Use the UserQueries hook for data fetching
    const usersQuery = UserQueries.useList(queryParams);

    // Get the total count for the current filters
    const countQuery = UserQueries.useCount({
        name: filters.name,
        email: filters.email,
        roleId: filters.roleId,
        isActive: filters.isActive !== undefined
            ? filters.isActive ? 1 : 0
            : undefined,
    });

    // Memoize table columns
    const columns = useMemo(() => createTableColumns(), []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, [setCurrentPage]);

    // Create table props
    const tableProps = useMemo(() => ({
        columns,
        rowKey: "id",
        onRow: (user: User) => ({
            onClick: () => Navigation.Users.toDetails(user.id),
            style: {
                cursor: "pointer",
                transition: "background-color 0.3s",
            },
        }),
    }), [columns]);

    // Handle filter updates
    const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
        setFilters(newFilters);
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [setFilters, setCurrentPage]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        resetFilters();
        // Reset to first page
        setCurrentPage(1);
    }, [resetFilters, setCurrentPage]);

    // Extract roles data for filtering
    const roles = useMemo(() => {
        if (!rolesQuery.data?.roles) return [];
        return rolesQuery.data.roles.map((role) => ({
            id: role.id,
            name: role.name,
        }));
    }, [rolesQuery.data?.roles]);

    // Default empty data for type safety
    const defaultData = {
        users: [] as User[],
        total: 0,
    };

    // Map the query to our AsyncState pattern
    return mapQueryToAsyncState(usersQuery, {
        loadingMessage: "Loading users...",
        // Provide localData for when we have data but it's refreshing
        localData: usersQuery.data || defaultData,
        onSuccess: (data) => {
            return new UsersListSuccessState({
                data,
                tableProps,
                filters,
                pagination: {
                    current: currentPage,
                    pageSize,
                    total: data.total || 0,
                    onChange: handlePageChange,
                },
                loading: usersQuery.isRefetching || countQuery.isRefetching ||
                    rolesQuery.isLoading,
                roles,
                actions: {
                    refresh: () => {
                        usersQuery.refetch();
                        countQuery.refetch();
                        rolesQuery.refetch();
                    },
                    updateFilters,
                    clearFilters,
                },
            });
        },
    });
};
