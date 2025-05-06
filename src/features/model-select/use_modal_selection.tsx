import { useCallback, useState } from 'react';
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from '@/lib/state';
import { TableProps } from 'antd/lib/table';
import { UseQueryResult } from '@tanstack/react-query';

// Generic model selection state class
export class ModelSelectionSuccessState<T> extends SuccessState<{
  items: T[];
  total: number;
}> {
  readonly tableProps: TableProps<T>;
  readonly filters: Record<string, any>;
  readonly pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  readonly loading: boolean;

  constructor(args: {
    data: { items: T[]; total: number };
    tableProps: TableProps<T>;
    filters: Record<string, any>;
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      onChange: (page: number, pageSize: number) => void;
    };
    loading: boolean;
    actions: {
      refresh: () => void;
      search: (term: string) => void;
      updateFilters: (filters: Record<string, any>) => void;
      clearFilters: () => void;
    };
  }) {
    super(args.data, { refresh: args.actions.refresh });
    this.tableProps = args.tableProps;
    this.filters = args.filters;
    this.pagination = args.pagination;
    this.loading = args.loading;
    this._search = args.actions.search;
    this._updateFilters = args.actions.updateFilters;
    this._clearFilters = args.actions.clearFilters;
  }

  private _search: (term: string) => void;
  private _updateFilters: (filters: Record<string, any>) => void;
  private _clearFilters: () => void;

  search(term: string): void {
    this._search(term);
  }

  updateFilters(filters: Record<string, any>): void {
    this._updateFilters(filters);
  }

  clearFilters(): void {
    this._clearFilters();
  }

  // Type guard to check if a state is a ModelSelectionSuccessState
  static is(state: any): state is ModelSelectionSuccessState<any> {
    return (
      state.type === UI_STATE_TYPE.SUCCESS &&
      "tableProps" in state &&
      "filters" in state &&
      "pagination" in state &&
      "search" in state
    );
  }
}

// Type for query response
export interface QueryResponse<T> {
  items: T[];
  total: number;
}

// Generic hook for model selection
export function useModelSelection<T, Q>({
  query,
  columns,
  getQueryParams,
  defaultFilters = {},
  defaultPageSize = 10
}: {
  // This accepts a function that returns a query result
  query: (params: Q) => UseQueryResult<QueryResponse<T>, Error>;
  columns: TableProps<T>['columns'];
  getQueryParams: (filters: Record<string, any>, pagination: { current: number; pageSize: number }) => Q;
  defaultFilters?: Record<string, any>;
  defaultPageSize?: number;
}) {
  // State for filters and pagination
  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: defaultPageSize
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Generate query parameters based on filters and pagination
  const queryParams = getQueryParams(
    { ...filters, searchTerm },
    pagination
  );

  // Execute the query with the generated parameters
  const queryResult = query(queryParams);

  // Handle pagination change
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Handle filter updates
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setPagination({ current: 1, pageSize: defaultPageSize });
  }, [defaultFilters, defaultPageSize]);

  // Basic table props
  const tableProps: TableProps<T> = {
    columns,
    rowKey: 'id'
  };

  // Map the query to our AsyncState pattern
  return mapQueryToAsyncState(queryResult, {
    loadingMessage: "Loading items...",
    onSuccess: (data) => {
      return new ModelSelectionSuccessState<T>({
        data: {
          items: data.items || [],
          total: data.total || 0
        },
        tableProps,
        filters: { ...filters, searchTerm },
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data.total || 0,
          onChange: handlePaginationChange
        },
        loading: queryResult.isRefetching,
        actions: {
          refresh: queryResult.refetch,
          search: handleSearch,
          updateFilters,
          clearFilters
        }
      });
    }
  });
}