import { JSX } from "react";
import {
    IErrorState,
    ILoadingState,
    IPermissionErrorState,
    UI_STATE_TYPE,
    UIStateBase,
} from "../_state";
import { Member } from "@/models";

export interface MemberListPageUISuccessState
    extends UIStateBase<UI_STATE_TYPE.success> {
    renderTable: () => JSX.Element;
    actions: {
        addNew: () => void;
        refresh: () => void;
        member: {
            edit: (member: Member) => void;
            view: (member: Member) => void;
            delete: (member: Member) => void;
        };
    };
}

export type MemberListPageUIState =
    | MemberListPageUISuccessState
    | IErrorState
    | IPermissionErrorState
    | ILoadingState;
