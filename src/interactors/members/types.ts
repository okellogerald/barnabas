import { JSX } from "react";
import {
    IErrorState,
    ILoadingState,
    IPermissionErrorState,
    UI_STATE_TYPE,
    UIStateBase,
} from "../_state";
import { Member } from "@/models";
import { MembersTableActions } from "./store";

/**
 * Success state for the member list page
 * Contains UI rendering functions and action handlers
 */
export interface MemberListSuccessState
    extends UIStateBase<UI_STATE_TYPE.success> {
    table: {
        render: () => JSX.Element;
        memberCount: number;
    };
    actions: MemberListActions;
}

/**
 * Actions available in the member list UI
 */
export interface MemberListActions {
    /** Create a new member */
    addNew: () => void;
    /** Table-related actions */
    table: Omit<MembersTableActions, "reset"> & {
        /** Fetch more members when paginating */
        fetchMore: (page: number) => Promise<void>;

        /** Refresh the member list */
        refresh: () => void;
    };
    /** Member-specific actions */
    member: {
        /** Open member edit form */
        edit: (member: Member) => void;
        /** View member details */
        view: (member: Member) => void;
        /** Delete a member */
        delete: (member: Member) => void;
    };
}

/**
 * Represents all possible states of the member list page
 */
export type MemberListPageUIState =
    | MemberListSuccessState
    | IErrorState
    | IPermissionErrorState
    | ILoadingState;

/**
 * Query result from fetching members
 */
export interface MembersQueryResult {
    members: Member[];
    total: number;
}

/**
 * Parameters for fetching members
 */
export interface MemberListQueryParams {
    fellowshipId?: string;
    baptized?: boolean;
    attendsFellowship?: boolean;
    search?: string;
}

/**
 * Parameters for fetching more members during pagination
 */
export interface FetchMoreParams extends MemberListQueryParams {
    currPage: number;
    nextPage: number;
    total: number;
}
