import { useCallback, useMemo, useState } from 'react';
import { Form, TableProps } from 'antd';
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from '@/lib/state';
import { VolunteerOpportunity } from '@/models';
import { VolunteerQueries } from '../../../data/volunteer/volunteer.queries';
import { VolunteerOpportunityQueryBuilder } from '@/data/volunteer';
import { SortDirection } from '@/lib/query';
import { Navigation } from '@/app';

/**
 * Custom success state for the volunteer opportunities list
 */
export class VolunteerListSuccessState extends SuccessState<{ opportunities: VolunteerOpportunity[], total: number }> {
  readonly tableProps: TableProps<VolunteerOpportunity>;
  readonly filters: {
    name?: string;
    sortBy?: string;
    sortDirection?: SortDirection;
  };
  readonly pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  readonly loading: boolean;

  constructor(args: {
    data: { opportunities: VolunteerOpportunity[], total: number };
    tableProps: TableProps<VolunteerOpportunity>;
    filters: {
      name?: string;
      sortBy?: string;
      sortDirection?: SortDirection;
    };
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      onChange: (page: number, pageSize?: number) => void;
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

  static is(state: any): state is VolunteerListSuccessState {
    return (
      state.type === UI_STATE_TYPE.SUCCESS &&
      "tableProps" in state &&
      "filters" in state &&
      "pagination" in state
    );
  }
}

/**
 * Hook for managing volunteer opportunities list
 * Handles filtering, sorting, pagination and data loading
 */
export function useVolunteerList() {
  // Form instance for filter form
  const [form] = Form.useForm();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<{
    name?: string;
    sortBy?: string;
    sortDirection?: SortDirection;
  }>({
    sortBy: 'name',
    sortDirection: SortDirection.ASC
  });

  // Create table columns
  const columns = useMemo(() => [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    }
  ], []);

  // Create query criteria
  const queryCriteria = useMemo(() => {
    const builder = VolunteerOpportunityQueryBuilder.newInstance();

    // Apply filters
    if (filters.name) {
      builder.filterByName(filters.name);
    }

    // Apply sorting
    if (filters.sortBy) {
      builder.orderBy(filters.sortBy, filters.sortDirection || SortDirection.ASC);
    }

    // Apply pagination
    builder.paginate(currentPage, pageSize);

    // No need to include interestedMembers

    return builder;
  }, [filters, currentPage, pageSize]);

  // Fetch data using the query
  const opportunitiesQuery = VolunteerQueries.useList(queryCriteria);

  // Handle page change
  const handlePageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  }, []);

  // Handle filter updates
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle filter reset
  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: 'name',
      sortDirection: SortDirection.ASC
    });
    form.resetFields();
    setCurrentPage(1);
  }, [form]);

  // Create table props
  const tableProps = useMemo(() => ({
    columns,
    rowKey: "id",
    onRow: (opportunity: VolunteerOpportunity) => ({
      onClick: () => Navigation.Opportunities.toDetails(opportunity.id),
      style: {
        cursor: "pointer",
        transition: "background-color 0.3s",
      },
    }),
  }), [columns]);

  // Map query to AsyncState
  return mapQueryToAsyncState(opportunitiesQuery, {
    loadingMessage: "Loading volunteer opportunities...",
    onSuccess: (data) => {
      return new VolunteerListSuccessState({
        data,
        tableProps,
        filters,
        pagination: {
          current: currentPage,
          pageSize,
          total: data.total || 0,
          onChange: handlePageChange,
        },
        loading: opportunitiesQuery.isRefetching,
        actions: {
          refresh: () => opportunitiesQuery.refetch(),
          updateFilters,
          clearFilters,
        }
      });
    }
  });
}