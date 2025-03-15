import {
    MemberListActions,
    MemberListSuccessState,
    MembersQueryResult,
} from "./types";
import { UI_STATE_TYPE } from "../_state";
import { MembersTableActions, MembersTableState } from "./store.table";
import { renderMemberTable } from "./table_renderer";
import { Member } from "@/models";
import { MemberFilterActions, MemberFilterState } from "./store.filters";
import { memberService } from "./service";
import { Navigation } from "@/app";

/**
 * Creates the success state for the member list UI
 * @param params Parameters for creating the success state
 * @returns The success state object
 */
export const createSuccessState = (params: {
    initialFetchResult: MembersQueryResult;
    tableStore: MembersTableState & MembersTableActions;
    filterStore: MemberFilterState & MemberFilterActions;
}): MemberListSuccessState => {
    const { tableStore, filterStore } = params;

    // Create actions object
    const actions: MemberListActions = {
        addNew: () => {
            Navigation.Members.toCreate();
        },

        table: {
            ...tableStore,
            ...filterStore,
            refresh: () => memberService.refresh(),
            fetchMore: memberService.handlePagination,
        },

        member: {
            view: (member: Member) => {
                tableStore.expandMember(member);
            },

            edit: (member: Member) => {
                // Navigate to member edit form or open modal
                console.log("Edit member action", member.id);
            },

            delete: (member: Member) => {
                // Show confirmation dialog and handle deletion
                console.log("Delete member action", member.id);
            },
        },
    };

    // Return the success state
    return {
        type: UI_STATE_TYPE.success,
        table: {
            memberCount: tableStore.pagination.totalResults,
            filters: filterStore,
            render: () =>
                renderMemberTable({
                    members: tableStore.members.all,
                    actions,
                    tableState: tableStore,
                }),
        },
        actions,
    };
};
