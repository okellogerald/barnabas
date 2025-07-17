// import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// import { Member } from '@/models';
// import { SuccessState, SuccessStateActions, UI_STATE_TYPE } from '@/lib/state';
// import { MemberQueries } from '@/data/member';
// import { MemberQueryBuilder, MemberQueryCriteria } from '@/data/member/member.query-builder';
// import { SortDirection } from '@/lib/query';
// import { mapQueryToAsyncState } from '@/lib/state';
// import { MemberColumns, MemberExpandedRowView } from '@/components/member';
// import { DMPTable } from '@/components/table';
// import { Navigation, useAppNavigation } from '@/app';

// // ===============================================================
// // ==================== STATE MANAGEMENT =========================
// // ===============================================================

// /**
//  * Member table state
//  */
// interface MembersTableState {
//     pagination: {
//         currPage: number;
//         totalResults: number;
//         resultsPerPage: number;
//     };
//     member?: {
//         expanded?: Member;
//     };
// }

// /**
//  * Member list actions
//  */
// interface MemberListActions {
//     member: {
//         view: (member: Member) => void;
//         edit: (member: Member) => void;
//         delete: (member: Member) => void;
//     };
//     table: {
//         fetchMore: (page: number) => void;
//         expandMember: (member: Member) => void;
//         refresh: () => void;
//         toggleFiltersVisible: () => void;
//         applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
//         clearFilters: () => void;
//         setSorting: (field: string, direction: 'asc' | 'desc') => void;
//     };
// }

// /**
//  * Member filter state store
//  */
// interface MemberListFilterState {
//     // Filter values
//     filters: {
//         search: string;
//         firstName: string;
//         lastName: string;
//         fellowshipId?: string;
//         gender?: string;
//         maritalStatus?: string;
//         memberRole?: string;
//         isBaptized?: boolean;
//         isConfirmed?: boolean;
//         attendsFellowship?: boolean;
//         filtersVisible: boolean;
//         filtersApplied: boolean;
//     };

//     // Sorting
//     orderBy?: string;
//     orderByDesc?: string;

//     // Pagination
//     currentPage: number;
//     pageSize: number;

//     // Actions
//     setFilter: <K extends keyof MemberListFilterState['filters']>(
//         key: K,
//         value: MemberListFilterState['filters'][K]
//     ) => void;
//     applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
//     clearFilters: () => void;
//     toggleFiltersVisible: () => void;
//     setSorting: (field: string, direction: 'asc' | 'desc') => void;
//     setCurrentPage: (page: number) => void;
//     setPageSize: (size: number) => void;
// }

// /**
//  * Default filter values
//  */
// const defaultFilters = {
//     search: '',
//     firstName: '',
//     lastName: '',
//     fellowshipId: undefined,
//     gender: undefined,
//     maritalStatus: undefined,
//     memberRole: undefined,
//     isBaptized: undefined,
//     isConfirmed: undefined,
//     attendsFellowship: undefined,
//     filtersVisible: false,
//     filtersApplied: false,
// };

// /**
//  * Member list filter store
//  */
// export const memberFilterStore = create<MemberListFilterState>()(
//     persist(
//         (set) => ({
//             // Initial state
//             filters: { ...defaultFilters },
//             orderBy: 'lastName',
//             orderByDesc: undefined,
//             currentPage: 1,
//             pageSize: 10,

//             // Actions
//             setFilter: (key, value) =>
//                 set((state) => ({
//                     filters: {
//                         ...state.filters,
//                         [key]: value
//                     }
//                 })),

//             applyFilters: (newFilters) =>
//                 set((state) => ({
//                     filters: {
//                         ...state.filters,
//                         ...newFilters,
//                         filtersApplied: true
//                     },
//                     currentPage: 1, // Reset to first page on filter change
//                 })),

//             clearFilters: () =>
//                 set((state) => ({
//                     filters: {
//                         ...defaultFilters,
//                         filtersVisible: state.filters.filtersVisible
//                     },
//                     currentPage: 1,
//                 })),

//             toggleFiltersVisible: () =>
//                 set((state) => ({
//                     filters: {
//                         ...state.filters,
//                         filtersVisible: !state.filters.filtersVisible
//                     }
//                 })),

//             setSorting: (field, direction) =>
//                 set(() => ({
//                     orderBy: direction === 'asc' ? field : undefined,
//                     orderByDesc: direction === 'desc' ? field : undefined,
//                     currentPage: 1, // Reset to first page on sort change
//                 })),

//             setCurrentPage: (page) =>
//                 set(() => ({
//                     currentPage: page
//                 })),

//             setPageSize: (size) =>
//                 set(() => ({
//                     pageSize: size,
//                     currentPage: 1, // Reset to first page when changing page size
//                 })),
//         }),
//         {
//             name: 'member-list-filters', // Storage key
//             partialize: (state) => ({
//                 filters: state.filters,
//                 orderBy: state.orderBy,
//                 orderByDesc: state.orderByDesc,
//                 pageSize: state.pageSize,
//             }),
//         },
//     ),
// );

// // ===============================================================
// // ====================== SUCCESS STATE ==========================
// // ===============================================================

// interface MemberListSuccessStateActions extends SuccessStateActions {
//     addNew: () => void;
//     viewDetails: (id: string) => void;
//     editMember: (member: Member) => void;
//     deleteMember: (member: Member) => void;
//     table: {
//         refresh: () => void;
//         toggleFiltersVisible: () => void;
//         applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
//         clearFilters: () => void;
//         setSorting: (field: string, direction: 'asc' | 'desc') => void;
//         fetchMore: (page: number) => void;
//         expandMember: (member: Member) => void;
//     }
// }

// /**
//  * Extended success state for member list
//  */
// export class MemberListSuccessState extends SuccessState<{ members: Member[], total: number }> {
//     override actions: MemberListSuccessStateActions;

//     readonly table: {
//         filters: MemberListFilterState['filters'] & {
//             orderBy?: string;
//             orderByDesc?: string;
//         };
//         memberCount: number;
//         loading: boolean;
//         render: () => JSX.Element;
//     };

//     readonly tableState: MembersTableState;

//     constructor(args: {
//         data: { members: Member[], total: number };
//         loading: boolean;
//         filterState: MemberListFilterState['filters'] & {
//             orderBy?: string;
//             orderByDesc?: string;
//         };
//         tableState: MembersTableState;
//         actions: MemberListSuccessStateActions;
//     }) {
//         super(args.data, args.actions);
//         this.actions = args.actions;
//         this.tableState = args.tableState;

//         this.table = {
//             filters: args.filterState,
//             memberCount: args.data.total,
//             loading: args.loading,
//             render: () => this.renderTable()
//         };
//     }

//     /**
//      * Renders the member table using the table renderer
//      */
//     private renderTable(): JSX.Element {
//         // Map actions to the format expected by the table renderer
//         const tableActions: MemberListActions = {
//             member: {
//                 view: (member) => this.actions.viewDetails(member.id),
//                 edit: this.actions.editMember,
//                 delete: this.actions.deleteMember
//             },
//             table: {
//                 fetchMore: this.actions.table.fetchMore,
//                 expandMember: this.actions.table.expandMember,
//                 refresh: this.actions.table.refresh,
//                 toggleFiltersVisible: this.actions.table.toggleFiltersVisible,
//                 applyFilters: this.actions.table.applyFilters,
//                 clearFilters: this.actions.table.clearFilters,
//                 setSorting: this.actions.table.setSorting
//             }
//         };

//         // Render the table using the table renderer
//         return renderMemberTable({
//             members: this.data.members,
//             actions: tableActions,
//             tableState: this.tableState
//         });
//     }

//     static is(state: any): state is MemberListSuccessState {
//         return (
//             state.type === UI_STATE_TYPE.SUCCESS &&
//             "table" in state &&
//             "actions" in state
//         );
//     }
// }

// /**
//  * Parameters for rendering the member table
//  */
// interface TableRenderParams {
//     /** Members to display */
//     members: Member[];
//     /** Actions available in the UI */
//     actions: MemberListActions;
//     /** Current table state */
//     tableState: MembersTableState;
// }

// /**
//  * Renders the member table with all functionality
//  * @param params Rendering parameters
//  * @returns JSX element for the table
//  */
// export const renderMemberTable = (params: TableRenderParams): JSX.Element => {
//     const { members, actions, tableState } = params;

//     // Determine which rows are expanded
//     const expandedRowKeys = tableState.member?.expanded
//         ? [tableState.member.expanded.id]
//         : [];

//     return (
//         <DMPTable
//             dataSource={members}
//             rowKey="id"
//             onRow={(data) => {
//                 return {
//                     onClick: () => Navigation.Members.toDetails(data.id)
//                 }
//             }}
//             expandable={{
//                 expandedRowKeys,
//                 onExpand(_, record) {
//                     actions.table.expandMember(record);
//                 },
//                 expandedRowRender: (record) => <MemberExpandedRowView record={record} />,
//             }}
//             pagination={{
//                 current: tableState.pagination.currPage,
//                 total: tableState.pagination.totalResults,
//                 pageSize: tableState.pagination.resultsPerPage,
//                 onChange: (page) => actions.table.fetchMore(page),
//             }}
//             columns={[
//                 MemberColumns.avatar,
//                 MemberColumns.firstName,
//                 MemberColumns.lastName,
//                 MemberColumns.age,
//                 MemberColumns.fellowship,
//                 MemberColumns.role,
//                 MemberColumns.envelope,
//                 MemberColumns.registrationDate,
//             ]}
//         />
//     );
// };

// // Helper to check if any filters are applied
// export const canApplyFilters = (filters: any): boolean => {
//     return Object.entries(filters).some(([key, value]) => {
//         if (key === 'filtersVisible' || key === 'filtersApplied') return false;
//         return value !== undefined && value !== '' && value !== null;
//     });
// };

// // ===============================================================
// // ======================= HOOK LOGIC ============================
// // ===============================================================

// /**
//  * Custom hook for member list page
//  * Manages UI state, data fetching, filtering, and sorting
//  */
// export const useMemberList = () => {
//     const navigate = useAppNavigation();
//     const filterState = memberFilterStore();

//     // Local state for expanded member
//     const [expandedMember, setExpandedMember] = useState<Member | undefined>(undefined);

//     // Create query criteria from filter state
//     const queryBuilder = useMemo((): MemberQueryBuilder => {
//         // Convert filter store state to query criteria
//         const criteria: MemberQueryCriteria = {
//             // Pagination
//             page: filterState.currentPage,
//             pageSize: filterState.pageSize,

//             // Filters
//             search: filterState.filters.search,
//             name: filterState.filters.firstName || filterState.filters.lastName
//                 ? `${filterState.filters.firstName} ${filterState.filters.lastName}`.trim()
//                 : undefined,
//             fellowshipId: filterState.filters.fellowshipId,
//             gender: filterState.filters.gender,
//             maritalStatus: filterState.filters.maritalStatus,
//             memberRole: filterState.filters.memberRole,
//             isBaptized: filterState.filters.isBaptized,
//             isConfirmed: filterState.filters.isConfirmed,
//             attendsFellowship: filterState.filters.attendsFellowship,

//             // Sorting
//             sortBy: filterState.orderBy || filterState.orderByDesc || 'lastName',
//             sortDirection: filterState.orderBy
//                 ? SortDirection.ASC
//                 : SortDirection.DESC,
//         };
//         return MemberQueryBuilder.createFromCriteria(criteria).includeDefaultRelations();
//     }, [
//         filterState.currentPage,
//         filterState.pageSize,
//         filterState.filters,
//         filterState.orderBy,
//         filterState.orderByDesc
//     ]);

//     // Fetch members data
//     const membersQuery = MemberQueries.usePaginatedList(queryBuilder);

//     // Table state
//     const tableState: MembersTableState = useMemo(() => ({
//         pagination: {
//             currPage: filterState.currentPage,
//             totalResults: membersQuery.data?.total || 0,
//             resultsPerPage: filterState.pageSize
//         },
//         member: expandedMember ? { expanded: expandedMember } : undefined
//     }), [filterState.currentPage, filterState.pageSize, membersQuery.data?.total, expandedMember]);

//     // Action handlers
//     const handleFetchMore = useCallback((page: number) => {
//         memberFilterStore.getState().setCurrentPage(page);
//     }, []);

//     const handleExpandMember = useCallback((member: Member) => {
//         setExpandedMember(prev => prev?.id === member.id ? undefined : member);
//     }, []);

//     const handleAddNew = useCallback(() => {
//         navigate.Members.toCreate();
//     }, [navigate]);

//     const handleViewDetails = useCallback((id: string) => {
//         navigate.Members.toDetails(id);
//     }, [navigate]);

//     const handleEditMember = useCallback((member: Member) => {
//         navigate.Members.toEdit(member.id);
//     }, [navigate]);

//     const handleDeleteMember = useCallback((member: Member) => {
//         // Implement delete functionality
//         console.log('Delete member:', member.id);
//         // You would typically show a confirmation dialog and then call a mutation
//     }, []);

//     const handleToggleFiltersVisible = useCallback(() => {
//         memberFilterStore.getState().toggleFiltersVisible();
//     }, []);

//     const handleApplyFilters = useCallback((filters: Partial<MemberListFilterState['filters']>) => {
//         memberFilterStore.getState().applyFilters(filters);
//     }, []);

//     const handleClearFilters = useCallback(() => {
//         memberFilterStore.getState().clearFilters();
//     }, []);

//     const handleSetSorting = useCallback((field: string, direction: 'asc' | 'desc') => {
//         memberFilterStore.getState().setSorting(field, direction);
//     }, []);

//     // Check for fellowship ID in URL parameters when component mounts
//     useEffect(() => {
//         const params = new URLSearchParams(window.location.search);
//         const fellowshipId = params.get('fellowshipId');

//         if (fellowshipId && (!filterState.filters.fellowshipId || filterState.filters.fellowshipId !== fellowshipId)) {
//             // Apply fellowship filter and refresh
//             handleApplyFilters({ fellowshipId });

//             // Clean up URL
//             navigate.Members.toList()
//         }
//     }, [navigate, filterState.filters.fellowshipId, handleApplyFilters]);

//     // Map query result to our extended success state
//     return mapQueryToAsyncState(membersQuery, {
//         loadingMessage: "Loading members...",
//         onSuccess: (data) => {
//             return new MemberListSuccessState({
//                 data,
//                 loading: membersQuery.isRefetching,
//                 filterState: {
//                     ...filterState.filters,
//                     orderBy: filterState.orderBy,
//                     orderByDesc: filterState.orderByDesc,
//                 },
//                 tableState,
//                 actions: {
//                     refresh: () => membersQuery.refetch(),
//                     addNew: handleAddNew,
//                     viewDetails: handleViewDetails,
//                     editMember: handleEditMember,
//                     deleteMember: handleDeleteMember,
//                     table: {
//                         refresh: () => membersQuery.refetch(),
//                         toggleFiltersVisible: handleToggleFiltersVisible,
//                         applyFilters: handleApplyFilters,
//                         clearFilters: handleClearFilters,
//                         setSorting: handleSetSorting,
//                         fetchMore: handleFetchMore,
//                         expandMember: handleExpandMember,
//                     }
//                 }
//             });
//         }
//     });
// };
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Member } from '@/models';
import { SuccessState, SuccessStateActions, UI_STATE_TYPE } from '@/lib/state';
import { MemberQueries } from '@/data/member';
import { MemberQueryBuilder, MemberQueryCriteria } from '@/data/member/member.query-builder';
import { SortDirection } from '@/lib/query';
import { mapQueryToAsyncState } from '@/lib/state';
import { MemberColumns, MemberExpandedRowView } from '@/components/member';
import { DMPTable } from '@/components/table';
import { Navigation, useAppNavigation } from '@/app';

// ===============================================================
// ==================== STATE MANAGEMENT =========================
// ===============================================================

/**
 * Member table state
 */
interface MembersTableState {
    pagination: {
        currPage: number;
        totalResults: number;
        resultsPerPage: number;
    };
    member?: {
        expanded?: Member;
    };
}

/**
 * Member list actions
 */
interface MemberListActions {
    member: {
        view: (member: Member) => void;
        edit: (member: Member) => void;
        delete: (member: Member) => void;
    };
    table: {
        fetchMore: (page: number) => void;
        expandMember: (member: Member) => void;
        refresh: () => void;
        toggleFiltersVisible: () => void;
        applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
        clearFilters: () => void;
        setSorting: (field: string, direction: 'asc' | 'desc') => void;
    };
}

/**
 * Enhanced Member filter state store with new filter fields
 */
interface MemberListFilterState {
    // Filter values
    filters: {
        search: string;
        firstName: string;
        lastName: string;
        fellowshipId?: string;
        gender?: string;
        maritalStatus?: string;
        memberRole?: string;
        educationLevel?: string;
        profession: string;
        hasEnvelope?: boolean;
        isBaptized?: boolean;
        isConfirmed?: boolean;
        attendsFellowship?: boolean;
        filtersVisible: boolean;
        filtersApplied: boolean;
    };

    // Sorting
    orderBy?: string;
    orderByDesc?: string;

    // Pagination
    currentPage: number;
    pageSize: number;

    // Actions
    setFilter: <K extends keyof MemberListFilterState['filters']>(
        key: K,
        value: MemberListFilterState['filters'][K]
    ) => void;
    applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
    clearFilters: () => void;
    toggleFiltersVisible: () => void;
    setSorting: (field: string, direction: 'asc' | 'desc') => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

/**
 * Enhanced default filter values including new fields
 */
const defaultFilters = {
    search: '',
    firstName: '',
    lastName: '',
    fellowshipId: undefined,
    gender: undefined,
    maritalStatus: undefined,
    memberRole: undefined,
    educationLevel: undefined,
    profession: '',
    hasEnvelope: undefined,
    isBaptized: undefined,
    isConfirmed: undefined,
    attendsFellowship: undefined,
    filtersVisible: false,
    filtersApplied: false,
};

/**
 * Enhanced member list filter store with new filter fields
 */
export const memberFilterStore = create<MemberListFilterState>()(
    persist(
        (set) => ({
            // Initial state
            filters: { ...defaultFilters },
            orderBy: 'lastName',
            orderByDesc: undefined,
            currentPage: 1,
            pageSize: 10,

            // Actions
            setFilter: (key, value) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        [key]: value
                    }
                })),

            applyFilters: (newFilters) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        ...newFilters,
                        filtersApplied: true
                    },
                    currentPage: 1, // Reset to first page on filter change
                })),

            clearFilters: () =>
                set((state) => ({
                    filters: {
                        ...defaultFilters,
                        filtersVisible: state.filters.filtersVisible
                    },
                    currentPage: 1,
                })),

            toggleFiltersVisible: () =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        filtersVisible: !state.filters.filtersVisible
                    }
                })),

            setSorting: (field, direction) =>
                set(() => ({
                    orderBy: direction === 'asc' ? field : undefined,
                    orderByDesc: direction === 'desc' ? field : undefined,
                    currentPage: 1, // Reset to first page on sort change
                })),

            setCurrentPage: (page) =>
                set(() => ({
                    currentPage: page
                })),

            setPageSize: (size) =>
                set(() => ({
                    pageSize: size,
                    currentPage: 1, // Reset to first page when changing page size
                })),
        }),
        {
            name: 'member-list-filters', // Storage key
            partialize: (state) => ({
                filters: state.filters,
                orderBy: state.orderBy,
                orderByDesc: state.orderByDesc,
                pageSize: state.pageSize,
            }),
        },
    ),
);

// ===============================================================
// ====================== SUCCESS STATE ==========================
// ===============================================================

interface MemberListSuccessStateActions extends SuccessStateActions {
    addNew: () => void;
    viewDetails: (id: string) => void;
    editMember: (member: Member) => void;
    deleteMember: (member: Member) => void;
    table: {
        refresh: () => void;
        toggleFiltersVisible: () => void;
        applyFilters: (filters: Partial<MemberListFilterState['filters']>) => void;
        clearFilters: () => void;
        setSorting: (field: string, direction: 'asc' | 'desc') => void;
        fetchMore: (page: number) => void;
        expandMember: (member: Member) => void;
    }
}

/**
 * Extended success state for member list
 */
export class MemberListSuccessState extends SuccessState<{ members: Member[], total: number }> {
    override actions: MemberListSuccessStateActions;

    readonly table: {
        filters: MemberListFilterState['filters'] & {
            orderBy?: string;
            orderByDesc?: string;
        };
        memberCount: number;
        loading: boolean;
        render: () => JSX.Element;
    };

    readonly tableState: MembersTableState;

    constructor(args: {
        data: { members: Member[], total: number };
        loading: boolean;
        filterState: MemberListFilterState['filters'] & {
            orderBy?: string;
            orderByDesc?: string;
        };
        tableState: MembersTableState;
        actions: MemberListSuccessStateActions;
    }) {
        super(args.data, args.actions);
        this.actions = args.actions;
        this.tableState = args.tableState;

        this.table = {
            filters: args.filterState,
            memberCount: args.data.total,
            loading: args.loading,
            render: () => this.renderTable()
        };
    }

    /**
     * Renders the member table using the table renderer
     */
    private renderTable(): JSX.Element {
        // Map actions to the format expected by the table renderer
        const tableActions: MemberListActions = {
            member: {
                view: (member) => this.actions.viewDetails(member.id),
                edit: this.actions.editMember,
                delete: this.actions.deleteMember
            },
            table: {
                fetchMore: this.actions.table.fetchMore,
                expandMember: this.actions.table.expandMember,
                refresh: this.actions.table.refresh,
                toggleFiltersVisible: this.actions.table.toggleFiltersVisible,
                applyFilters: this.actions.table.applyFilters,
                clearFilters: this.actions.table.clearFilters,
                setSorting: this.actions.table.setSorting
            }
        };

        // Render the table using the table renderer
        return renderMemberTable({
            members: this.data.members,
            actions: tableActions,
            tableState: this.tableState
        });
    }

    static is(state: any): state is MemberListSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "table" in state &&
            "actions" in state
        );
    }
}

/**
 * Parameters for rendering the member table
 */
interface TableRenderParams {
    /** Members to display */
    members: Member[];
    /** Actions available in the UI */
    actions: MemberListActions;
    /** Current table state */
    tableState: MembersTableState;
}

/**
 * Renders the member table with all functionality
 * @param params Rendering parameters
 * @returns JSX element for the table
 */
export const renderMemberTable = (params: TableRenderParams): JSX.Element => {
    const { members, actions, tableState } = params;

    // Determine which rows are expanded
    const expandedRowKeys = tableState.member?.expanded
        ? [tableState.member.expanded.id]
        : [];

    return (
        <DMPTable
            dataSource={members}
            rowKey="id"
            onRow={(data) => {
                return {
                    onClick: () => Navigation.Members.toDetails(data.id)
                }
            }}
            expandable={{
                expandedRowKeys,
                onExpand(_, record) {
                    actions.table.expandMember(record);
                },
                expandedRowRender: (record) => <MemberExpandedRowView record={record} />,
            }}
            pagination={{
                current: tableState.pagination.currPage,
                total: tableState.pagination.totalResults,
                pageSize: tableState.pagination.resultsPerPage,
                onChange: (page) => actions.table.fetchMore(page),
            }}
            columns={[
                MemberColumns.avatar,
                MemberColumns.firstName,
                MemberColumns.lastName,
                MemberColumns.age,
                MemberColumns.fellowship,
                MemberColumns.role,
                MemberColumns.envelope,
                MemberColumns.registrationDate,
            ]}
        />
    );
};

// Enhanced helper to check if any filters are applied (including new filters)
export const canApplyFilters = (filters: any): boolean => {
    return Object.entries(filters).some(([key, value]) => {
        if (key === 'filtersVisible' || key === 'filtersApplied') return false;
        return value !== undefined && value !== '' && value !== null;
    });
};

// ===============================================================
// ======================= HOOK LOGIC ============================
// ===============================================================

/**
 * Enhanced custom hook for member list page with new filter support
 * Manages UI state, data fetching, filtering, and sorting including new filters:
 * - Education level filtering
 * - Profession search
 * - Envelope status filtering
 */
export const useMemberList = () => {
    const navigate = useAppNavigation();
    const filterState = memberFilterStore();

    // Local state for expanded member
    const [expandedMember, setExpandedMember] = useState<Member | undefined>(undefined);

    // Create query criteria from filter state including new filters
    const queryBuilder = useMemo((): MemberQueryBuilder => {
        // Convert filter store state to query criteria
        const criteria: MemberQueryCriteria = {
            // Pagination
            page: filterState.currentPage,
            pageSize: filterState.pageSize,

            // Filters
            search: filterState.filters.search,
            firstName: filterState.filters.firstName,
            lastName: filterState.filters.lastName,
            fellowshipId: filterState.filters.fellowshipId,
            gender: filterState.filters.gender,
            maritalStatus: filterState.filters.maritalStatus,
            memberRole: filterState.filters.memberRole,

            // NEW FILTERS
            educationLevel: filterState.filters.educationLevel,
            profession: filterState.filters.profession || undefined,
            hasEnvelope: filterState.filters.hasEnvelope,

            // Existing filters
            isBaptized: filterState.filters.isBaptized,
            isConfirmed: filterState.filters.isConfirmed,
            attendsFellowship: filterState.filters.attendsFellowship,

            // Sorting
            sortBy: filterState.orderBy || filterState.orderByDesc || 'lastName',
            sortDirection: filterState.orderBy
                ? SortDirection.ASC
                : SortDirection.DESC,
        };
        return MemberQueryBuilder.createFromCriteria(criteria).includeDefaultRelations();
    }, [
        filterState.currentPage,
        filterState.pageSize,
        filterState.filters,
        filterState.orderBy,
        filterState.orderByDesc
    ]);

    // Fetch members data
    const membersQuery = MemberQueries.usePaginatedList(queryBuilder);

    // Table state
    const tableState: MembersTableState = useMemo(() => ({
        pagination: {
            currPage: filterState.currentPage,
            totalResults: membersQuery.data?.total || 0,
            resultsPerPage: filterState.pageSize
        },
        member: expandedMember ? { expanded: expandedMember } : undefined
    }), [filterState.currentPage, filterState.pageSize, membersQuery.data?.total, expandedMember]);

    // Action handlers
    const handleFetchMore = useCallback((page: number) => {
        memberFilterStore.getState().setCurrentPage(page);
    }, []);

    const handleExpandMember = useCallback((member: Member) => {
        setExpandedMember(prev => prev?.id === member.id ? undefined : member);
    }, []);

    const handleAddNew = useCallback(() => {
        navigate.Members.toCreate();
    }, [navigate]);

    const handleViewDetails = useCallback((id: string) => {
        navigate.Members.toDetails(id);
    }, [navigate]);

    const handleEditMember = useCallback((member: Member) => {
        navigate.Members.toEdit(member.id);
    }, [navigate]);

    const handleDeleteMember = useCallback((member: Member) => {
        // Implement delete functionality
        console.log('Delete member:', member.id);
        // You would typically show a confirmation dialog and then call a mutation
    }, []);

    const handleToggleFiltersVisible = useCallback(() => {
        memberFilterStore.getState().toggleFiltersVisible();
    }, []);

    const handleApplyFilters = useCallback((filters: Partial<MemberListFilterState['filters']>) => {
        memberFilterStore.getState().applyFilters(filters);
    }, []);

    const handleClearFilters = useCallback(() => {
        memberFilterStore.getState().clearFilters();
    }, []);

    const handleSetSorting = useCallback((field: string, direction: 'asc' | 'desc') => {
        memberFilterStore.getState().setSorting(field, direction);
    }, []);

    // Check for fellowship ID in URL parameters when component mounts
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fellowshipId = params.get('fellowshipId');

        if (fellowshipId && (!filterState.filters.fellowshipId || filterState.filters.fellowshipId !== fellowshipId)) {
            // Apply fellowship filter and refresh
            handleApplyFilters({ fellowshipId });

            // Clean up URL
            navigate.Members.toList()
        }
    }, [navigate, filterState.filters.fellowshipId, handleApplyFilters]);

    // Map query result to our extended success state
    return mapQueryToAsyncState(membersQuery, {
        loadingMessage: "Loading members...",
        onSuccess: (data) => {
            return new MemberListSuccessState({
                data,
                loading: membersQuery.isRefetching,
                filterState: {
                    ...filterState.filters,
                    orderBy: filterState.orderBy,
                    orderByDesc: filterState.orderByDesc,
                },
                tableState,
                actions: {
                    refresh: () => membersQuery.refetch(),
                    addNew: handleAddNew,
                    viewDetails: handleViewDetails,
                    editMember: handleEditMember,
                    deleteMember: handleDeleteMember,
                    table: {
                        refresh: () => membersQuery.refetch(),
                        toggleFiltersVisible: handleToggleFiltersVisible,
                        applyFilters: handleApplyFilters,
                        clearFilters: handleClearFilters,
                        setSorting: handleSetSorting,
                        fetchMore: handleFetchMore,
                        expandMember: handleExpandMember,
                    }
                }
            });
        }
    });
};