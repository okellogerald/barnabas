import { useCallback, useMemo } from "react";
import { TableProps } from "antd";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Role } from "@/models";
import { Navigation } from "@/app";
import { useRoleFilterStore } from "./store";
import { RoleQueries } from "../queries";

// Custom success state for the roles list
export class RolesListSuccessState extends SuccessState<{ roles: Role[], total: number }> {
    readonly tableProps: TableProps<Role>;
    readonly filters: {
        name?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
    };
    readonly pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number) => void;
    };
    readonly loading: boolean;

    constructor(args: {
        data: { roles: Role[], total: number };
        tableProps: TableProps<Role>;
        filters: {
            name?: string;
            sortBy?: string;
            sortDirection?: 'asc' | 'desc';
        };
        pagination: {
            current: number;
            pageSize: number;
            total: number;
            onChange: (page: number) => void;
        };
        loading: boolean;
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

    static is(state: any): state is RolesListSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "tableProps" in state &&
            "filters" in state &&
            "pagination" in state
        );
    }
}

// Create table columns for roles
const createTableColumns = () => {
    return [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
            render: (_, role) => role.getDisplayName(),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (_, role) => role.getDescription ? role.getDescription() : role.description || 'No description',
        }
    ] as TableProps<Role>["columns"];
};

// Main hook for role list
export const useRolesList = () => {
    // Get filter state from Zustand
    const {
        filters,
        pageSize,
        currentPage,
        setFilters,
        resetFilters,
        setCurrentPage
    } = useRoleFilterStore();

    // Convert filters to API query params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            rangeStart: (currentPage - 1) * pageSize,
            rangeEnd: (currentPage * pageSize) - 1,
        };

        // Name search
        if (filters.name) {
            params['name:like'] = `%${filters.name}%`;
        }

        // Sorting
        if (filters.sortBy) {
            if (filters.sortDirection === "asc") {
                params.orderBy = filters.sortBy;
            } else {
                params.orderByDesc = filters.sortBy
            }
        } else {
            // Default sorting
            params.orderBy = 'name';
        }

        return params;
    }, [filters, currentPage, pageSize]);

    // Use the RoleQueries hook for data fetching
    const rolesQuery = RoleQueries.useList(queryParams);

    // Get the total count for the current filters
    const countQuery = RoleQueries.useCount({
        name: filters.name
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
        onRow: (role: Role) => ({
            onClick: () => Navigation.Roles.toDetails(role.id),
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

    // Default empty data for type safety
    const defaultData = {
        roles: [] as Role[],
        total: 0
    };

    // Map the query to our AsyncState pattern
    return mapQueryToAsyncState(rolesQuery, {
        loadingMessage: "Loading roles...",
        // Provide localData for when we have data but it's refreshing
        localData: rolesQuery.data || defaultData,
        onSuccess: (data) => {
            return new RolesListSuccessState({
                data,
                tableProps,
                filters,
                pagination: {
                    current: currentPage,
                    pageSize,
                    total: data.total || 0,
                    onChange: handlePageChange,
                },
                loading: rolesQuery.isRefetching || countQuery.isRefetching,
                actions: {
                    refresh: () => {
                        rolesQuery.refetch();
                        countQuery.refetch();
                    },
                    updateFilters,
                    clearFilters,
                }
            });
        }
    });
};