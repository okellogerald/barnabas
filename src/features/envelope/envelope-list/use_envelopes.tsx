import { useCallback, useMemo } from "react";
import { TableProps } from "antd";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Envelope } from "@/models";
import { EnvelopeQueries } from "../queries";
import { useEnvelopeFilterStore } from "./filter_store";
import { Navigation } from "@/app";
import { EnvelopeQueryCriteria } from "@/data/envelope";
import { SortDirection } from "@/lib/query";

// Custom success state for the envelopes list
export class EnvelopesListSuccessState extends SuccessState<{ envelopes: Envelope[], total: number }> {
    readonly tableProps: TableProps<Envelope>;
    readonly filters: {
        number?: number;
        isAssigned?: boolean;
        memberId?: string;
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
        data: { envelopes: Envelope[], total: number };
        tableProps: TableProps<Envelope>;
        filters: {
            number?: number;
            isAssigned?: boolean;
            memberId?: string;
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

    static is(state: any): state is EnvelopesListSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "tableProps" in state &&
            "filters" in state &&
            "pagination" in state
        );
    }
}


// Create table columns for envelopes
const createTableColumns = () => {
    return [
        {
            title: "Envelope Number",
            dataIndex: "envelopeNumber",
            key: "envelopeNumber",
            sorter: true,
        },
        {
            title: "Status",
            key: "status",
            sorter: true,
            render: (_, envelope) => envelope.getStatus(),
        },
        {
            title: "Assignment",
            key: "assignment",
            render: (_, envelope) => envelope.getAssignmentInfo(),
        },
    ] as TableProps<Envelope>["columns"];
};

// Main hook for envelope list
export const useEnvelopesList = () => {
    // Get filter state from Zustand
    const {
        filters,
        pageSize,
        currentPage,
        setFilters,
        resetFilters,
        setCurrentPage
    } = useEnvelopeFilterStore();

    // Create the query criteria from filter state
    const queryCriteria = useMemo((): EnvelopeQueryCriteria => {
        return {
            // Pagination
            page: currentPage,
            pageSize,

            // Filters
            number: filters.number,
            isAssigned: filters.isAssigned,
            memberId: filters.memberId,

            // Sorting
            sortBy: filters.sortBy || 'envelopeNumber',
            sortDirection: filters.sortDirection || SortDirection.ASC,
        };
    }, [filters, currentPage, pageSize]);

    // Use the EnvelopeQueries hook with our query criteria
    const envelopesQuery = EnvelopeQueries.useList(queryCriteria);

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
        onRow: (envelope: Envelope) => ({
            onClick: () => Navigation.Envelopes.toDetails(envelope.id),
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

    // Map the query to our AsyncState pattern
    return mapQueryToAsyncState(envelopesQuery, {
        loadingMessage: "Loading envelopes...",
        onSuccess: (data) => {
            return new EnvelopesListSuccessState({
                data,
                tableProps,
                filters,
                pagination: {
                    current: currentPage,
                    pageSize,
                    total: data.total || 0,
                    onChange: handlePageChange,
                },
                loading: envelopesQuery.isRefetching,
                actions: {
                    refresh: () => {
                        envelopesQuery.refetch();
                    },
                    updateFilters,
                    clearFilters,
                }
            });
        }
    });
};