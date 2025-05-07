import { useCallback, useMemo, useEffect } from "react";
import { TableProps } from "antd";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Fellowship } from "@/models";
import { FellowshipQueries } from "../queries";
import { useFellowshipFilterStore } from "./filter_store";
import { Navigation } from "@/app";
import _ from "lodash";
import { useFellowshipMemberCounts } from "./use_fellowship_member_count";

// Custom success state for the fellowships list
export class FellowshipsListSuccessState extends SuccessState<{ fellowships: Fellowship[], total: number }> {
    readonly tableProps: TableProps<Fellowship>;
    readonly filters: {
        name?: string;
        memberCount?: string;
        hasLeadership?: boolean;
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
        data: { fellowships: Fellowship[], total: number };
        tableProps: TableProps<Fellowship>;
        filters: {
            searchTerm?: string;
            memberCount?: string;
            hasLeadership?: boolean;
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

    static is(state: any): state is FellowshipsListSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "tableProps" in state &&
            "filters" in state &&
            "pagination" in state
        );
    }
}

// Create table columns for fellowships
const createTableColumns = () => {
    return [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
            render: (_, fellowship) => fellowship.getDisplayName(),
        },
        {
            title: "Members",
            key: "memberCount",
            render: (_, fellowship) => fellowship.getMembershipSummary(),
        },
    ] as TableProps<Fellowship>["columns"];
};

// Helper function to filter fellowships by member count
const filterByMemberCount = (fellowships: Fellowship[], memberCountFilter?: string, counts?: Record<string, number>) => {
    if (!memberCountFilter || !counts) return fellowships;

    return fellowships.filter(fellowship => {
        const count = counts[fellowship.id] || 0;

        switch (memberCountFilter) {
            case 'empty':
                return count === 0;
            case 'small':
                return count > 0 && count <= 10;
            case 'medium':
                return count > 10 && count <= 30;
            case 'large':
                return count > 30;
            default:
                return true;
        }
    });
};

// Helper function to sort fellowships
const sortFellowships = (
    fellowships: Fellowship[],
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
    memberCounts?: Record<string, number>
): Fellowship[] => {
    if (!sortBy) return fellowships;

    return [...fellowships].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'memberCount':
                // Use the fetched counts if available
                const countA = memberCounts?.[a.id] ?? 0;
                const countB = memberCounts?.[b.id] ?? 0;
                comparison = countA - countB;
                break;
            case 'createdAt':
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
            default:
                return 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });
};

// Main hook for fellowship list
export const useFellowshipsList = () => {
    // Get filter state from Zustand
    const {
        filters,
        pageSize,
        currentPage,
        setFilters,
        resetFilters,
        setCurrentPage
    } = useFellowshipFilterStore();

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};

        // Search by name
        if (filters.name) {
            params['name:like'] = `%${filters.name}%`;
        }

        if (filters.hasLeadership === true) {
            // the left operand here does not matter, either 0 or 1
            params["chairmanId:notNull"] = 0
        }
        if (filters.hasLeadership === false) {
            // the left operand here does not matter, either 0 or 1
            params["chairmanId:isNull"] = 0
        }

        // Sorting
        if (filters.sortBy) {
            if (filters.sortDirection === "asc") {
                params.orderBy = `${filters.sortBy}`;
            } else {
                params.orderByDesc = filters.sortBy
            }
        } else {
            // Default sorting
            params.orderBy = 'name';
        }

        // Pagination

        return params;
    }, [filters, currentPage, pageSize]);

    // Use the FellowshipQueries hook for data fetching
    const fellowshipsQuery = FellowshipQueries.useList(queryParams);

    // Get the total count for the current filters
    const countQuery = FellowshipQueries.useCount({
        name: filters.name
    });

    // Extract fellowship IDs for the member count hook
    const fellowshipIds = useMemo(() => {
        if (!fellowshipsQuery.data?.fellowships) return [];
        return fellowshipsQuery.data.fellowships.map(fellowship => fellowship.id);
    }, [fellowshipsQuery.data?.fellowships]);

    // Use our custom hook to fetch member counts
    const { counts: memberCounts, loading: countsLoading } = useFellowshipMemberCounts(fellowshipIds);

    // Apply member counts to fellowship objects
    useEffect(() => {
        if (!fellowshipsQuery.data?.fellowships || !memberCounts) return;

        fellowshipsQuery.data.fellowships.forEach(fellowship => {
            if (memberCounts[fellowship.id] !== undefined) {
                // We're modifying the fellowship objects directly
                // This is a temporary solution until the API provides member counts
                (fellowship as any).memberCount = memberCounts[fellowship.id];
            }
        });
    }, [fellowshipsQuery.data?.fellowships, memberCounts]);

    // Memoize table columns
    const columns = useMemo(() => createTableColumns(), []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Changing page will update rangeStart/rangeEnd and trigger a refetch
    }, [setCurrentPage]);

    // Create table props
    const tableProps = useMemo(() => ({
        columns,
        rowKey: "id",
        onRow: (fellowship: Fellowship) => ({
            onClick: () => Navigation.Fellowships.toDetails(fellowship.id),
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

    // Apply client-side filtering based on member count
    const filteredFellowships = useMemo(() => {
        if (!fellowshipsQuery.data?.fellowships) {
            return { fellowships: [], total: 0 };
        }

        // Apply leadership filter first if needed
        let filtered = [...fellowshipsQuery.data.fellowships];

        if (filters.hasLeadership !== undefined) {
            filtered = filtered.filter(fellowship =>
                filters.hasLeadership === fellowship.hasLeadership()
            );
        }

        // Apply member count filter if needed
        if (filters.memberCount) {
            filtered = filterByMemberCount(filtered, filters.memberCount, memberCounts);
        }

        // Apply sorting if needed
        if (filters.sortBy) {
            filtered = sortFellowships(
                filtered,
                filters.sortBy,
                filters.sortDirection || 'asc',
                memberCounts
            );
        }

        return {
            fellowships: filtered,
            total: filtered.length
        };
    }, [
        fellowshipsQuery.data?.fellowships,
        filters.hasLeadership,
        filters.memberCount,
        filters.sortBy,
        filters.sortDirection,
        memberCounts
    ]);

    // Default empty data for type safety
    const defaultData = {
        fellowships: [] as Fellowship[],
        total: 0
    };

    // Map the query to our AsyncState pattern
    return mapQueryToAsyncState(fellowshipsQuery, {
        loadingMessage: "Loading fellowships...",
        // Provide localData for when we have data but it's refreshing
        localData: filteredFellowships.fellowships.length > 0 ? filteredFellowships : defaultData,
        onSuccess: () => {
            // Use our filtered data that includes client-side filtering
            const data = filteredFellowships;

            return new FellowshipsListSuccessState({
                data,
                tableProps,
                filters,
                pagination: {
                    current: currentPage,
                    pageSize,
                    total: data.total || 0,
                    onChange: handlePageChange,
                },
                loading: fellowshipsQuery.isRefetching || countQuery.isRefetching || countsLoading,
                actions: {
                    refresh: () => {
                        fellowshipsQuery.refetch();
                        countQuery.refetch();
                    },
                    updateFilters,
                    clearFilters,
                }
            });
        }
    });
};