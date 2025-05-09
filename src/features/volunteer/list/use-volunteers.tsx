// import { useCallback, useMemo, useState } from "react";
// import { Form, TableProps } from "antd";
// import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
// import { VolunteerOpportunity } from "@/models";
// import { VolunteerQueries } from "../volunteer.queries";
// import { Navigation } from "@/app";
// import { VolunteerOpportunityQueryCriteria } from "@/data/volunteer";
// import { SortDirection } from "@/lib/query";
// import { useVolunteerFilterStore } from "./use_volunteers_filters_store";

// // Custom success state for the volunteer opportunities list
// export class VolunteersListSuccessState extends SuccessState<{ opportunities: VolunteerOpportunity[], total: number }> {
//     readonly tableProps: TableProps<VolunteerOpportunity>;
//     readonly filters: {
//         name?: string;
//         description?: string;
//         memberId?: string;
//         hasMembers?: boolean;
//         sortBy?: string;
//         sortDirection?: 'asc' | 'desc';
//     };
//     readonly pagination: {
//         current: number;
//         pageSize: number;
//         total: number;
//         onChange: (page: number) => void;
//     };
//     readonly loading: boolean;
//     readonly filterForm: any;
//     readonly filterDrawerOpen: boolean;
//     readonly setFilterDrawerOpen: (open: boolean) => void;
//     readonly applyFilters: (values: any) => void;
//     readonly clearFilters: () => void;
//     readonly updateSortBy: (field: string) => void;
//     readonly toggleSortDirection: () => void;

//     constructor(args: {
//         data: { opportunities: VolunteerOpportunity[], total: number };
//         tableProps: TableProps<VolunteerOpportunity>;
//         filters: {
//             name?: string;
//             description?: string;
//             memberId?: string;
//             hasMembers?: boolean;
//             sortBy?: string;
//             sortDirection?: 'asc' | 'desc';
//         };
//         pagination: {
//             current: number;
//             pageSize: number;
//             total: number;
//             onChange: (page: number) => void;
//         };
//         loading: boolean;
//         filterForm: any;
//         filterDrawerOpen: boolean;
//         actions: {
//             refresh: () => void;
//             updateFilters: (filters: any) => void;
//             clearFilters: () => void;
//             setFilterDrawerOpen: (open: boolean) => void;
//             updateSortBy: (field: string) => void;
//             toggleSortDirection: () => void;
//             applyFilters: (values: any) => void;
//         };
//     }) {
//         super(args.data, { refresh: args.actions.refresh });
//         this.tableProps = args.tableProps;
//         this.filters = args.filters;
//         this.pagination = args.pagination;
//         this.loading = args.loading;
//         this.filterForm = args.filterForm;
//         this.filterDrawerOpen = args.filterDrawerOpen;
//         this.setFilterDrawerOpen = args.actions.setFilterDrawerOpen;
//         this.updateFilters = args.actions.updateFilters;
//         this.clearFilters = args.actions.clearFilters;
//         this.updateSortBy = args.actions.updateSortBy;
//         this.toggleSortDirection = args.actions.toggleSortDirection;
//         this.applyFilters = args.actions.applyFilters;
//         this._updateFilters = args.actions.updateFilters;
//     }

//     private _updateFilters: (filters: any) => void;

//     updateFilters(filters: any): void {
//         this._updateFilters(filters);
//     }

//     static is(state: any): state is VolunteersListSuccessState {
//         return (
//             state.type === UI_STATE_TYPE.SUCCESS &&
//             "tableProps" in state &&
//             "filters" in state &&
//             "pagination" in state &&
//             "filterDrawerOpen" in state
//         );
//     }
// }

// // Create table columns for volunteer opportunities
// const createTableColumns = () => {
//     return [
//         {
//             title: "Name",
//             dataIndex: "name",
//             key: "name",
//             sorter: true,
//         },
//         {
//             title: "Description",
//             dataIndex: "description",
//             key: "description",
//             ellipsis: true,
//             render: (description: string | null) => description || 'No description',
//         },
//         // {
//         //     title: "Interested Members",
//         //     key: "memberCount",
//         //     sorter: true,
//         //     render: (_, opportunity) => opportunity.getInterestSummary(),
//         // },
//     ] as TableProps<VolunteerOpportunity>["columns"];
// };

// // Main hook for volunteer opportunity list
// export const useVolunteersList = () => {
//     // Filter drawer state
//     const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

//     // Form instance for filters
//     const [filterForm] = Form.useForm();

//     // Get filter state from Zustand
//     const {
//         filters,
//         pageSize,
//         currentPage,
//         setFilters,
//         resetFilters,
//         setCurrentPage,
//         setSortBy
//     } = useVolunteerFilterStore();

//     // Create the query criteria from filter state
//     const queryCriteria = useMemo((): VolunteerOpportunityQueryCriteria => {
//         return {
//             // Pagination
//             page: currentPage,
//             pageSize,

//             // Filters
//             name: filters.name,
//             description: filters.description,

//             // Sorting
//             sortBy: filters.sortBy || 'name',
//             sortDirection: filters.sortDirection || SortDirection.ASC,
//         };
//     }, [filters, currentPage, pageSize]);

//     // Use the VolunteerQueries hook with our query criteria
//     const opportunitiesQuery = VolunteerQueries.useList(queryCriteria);

//     // Memoize table columns
//     const columns = useMemo(() => createTableColumns(), []);

//     // Handle page change
//     const handlePageChange = useCallback((page: number) => {
//         setCurrentPage(page);
//     }, [setCurrentPage]);

//     // Create table props
//     const tableProps = useMemo(() => ({
//         columns,
//         rowKey: "id",
//         onRow: (opportunity: VolunteerOpportunity) => ({
//             onClick: () => Navigation.Volunteers.toDetails(opportunity.id),
//             style: {
//                 cursor: "pointer",
//                 transition: "background-color 0.3s",
//             },
//         }),
//     }), [columns]);

//     // Handle filter updates
//     const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
//         setFilters(newFilters);
//         // Reset to first page when filters change
//         setCurrentPage(1);
//     }, [setFilters, setCurrentPage]);

//     // Handle sorting change
//     const updateSortBy = useCallback((field: string) => {
//         setSortBy(field, filters.sortDirection || SortDirection.ASC);
//     }, [filters.sortDirection, setSortBy]);

//     // Toggle sort direction
//     const toggleSortDirection = useCallback(() => {
//         const newDirection = filters.sortDirection === SortDirection.ASC
//             ? SortDirection.DESC
//             : SortDirection.ASC;

//         setSortBy(filters.sortBy || 'name', newDirection);
//     }, [filters.sortBy, filters.sortDirection, setSortBy]);

//     // Handle filter application
//     const applyFilters = useCallback((values: any) => {
//         const formattedValues = {
//             ...values,
//             // Ensure hasMembers is a boolean if it exists and not empty string
//             hasMembers: values.hasMembers === '' ? undefined :
//                 values.hasMembers === 'true' ? true :
//                     values.hasMembers === 'false' ? false : values.hasMembers,
//         };

//         updateFilters(formattedValues);
//         setFilterDrawerOpen(false);
//     }, [updateFilters]);

//     // Clear all filters
//     const clearFilters = useCallback(() => {
//         filterForm.resetFields();
//         resetFilters();
//         // Reset to first page
//         setCurrentPage(1);
//     }, [filterForm, resetFilters, setCurrentPage]);

//     // Map the query to our AsyncState pattern
//     return mapQueryToAsyncState(opportunitiesQuery, {
//         loadingMessage: "Loading volunteer opportunities...",
//         onSuccess: (data) => {
//             return new VolunteersListSuccessState({
//                 data,
//                 tableProps,
//                 filters,
//                 pagination: {
//                     current: currentPage,
//                     pageSize,
//                     total: data.total || 0,
//                     onChange: handlePageChange,
//                 },
//                 loading: opportunitiesQuery.isRefetching,
//                 filterForm,
//                 filterDrawerOpen,
//                 actions: {
//                     refresh: () => {
//                         opportunitiesQuery.refetch();
//                     },
//                     updateFilters,
//                     clearFilters,
//                     setFilterDrawerOpen,
//                     updateSortBy,
//                     toggleSortDirection,
//                     applyFilters
//                 }
//             });
//         }
//     });
// };
import { useCallback, useMemo, useState } from 'react';
import { Form, TableProps } from 'antd';
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from '@/lib/state';
import { VolunteerOpportunity } from '@/models';
import { VolunteerQueries } from '../volunteer.queries';
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
      onClick: () => Navigation.Volunteers.toDetails(opportunity.id),
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