import {
    MemberListActions,
    MemberListSuccessState,
    MembersQueryResult,
} from "./types";
import { UI_STATE_TYPE } from "../_state";
import { handlePagination } from "./service";
import { MembersTableActions, MembersTableState } from "./store";
import { renderMemberTable } from "./table_renderer";
import { Member } from "@/models";

/**
 * Creates the success state for the member list UI
 * @param params Parameters for creating the success state
 * @returns The success state object
 */
export const createSuccessState = (params: {
    initialFetchResult: MembersQueryResult;
    store: MembersTableState & MembersTableActions;
}): MemberListSuccessState => {
    const { store } = params;

    // Initialize the store if it's empty
    if (store.members.all.length === 0) {
        //store.init(initialFetchResult.members, initialFetchResult.total);
    }

    // Create actions object
    const actions: MemberListActions = {
        addNew: () => {
            // Navigate to member creation form or open modal
            // Implementation depends on your routing/modal system
            console.log("Add new member action");
        },

        table: {
            ...store,
            refresh: () => {},
            fetchMore: (page: number) => handlePagination(page),
        },

        member: {
            view: (member: Member) => {
                // Implementation for viewing a member
                store.expandMember(member);
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
            memberCount: store.pagination.totalResults,
            render: () =>
                renderMemberTable({
                    members: store.members.all,
                    actions,
                    tableState: store,
                }),
        },
        actions,
    };
};
