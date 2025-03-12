import { Church } from "@/models";
import {
    IErrorState,
    ILoadingState,
    IPermissionErrorState,
    UI_STATE_TYPE,
    UIStateBase,
} from "../_state";

export interface DashboardPageSuccessState
    extends UIStateBase<UI_STATE_TYPE.success> {
    church: Church;
    totalMembers: number | null; // null if user does not have necessary permission
    totalFellowships: number | null; // null if user does not have necessary permission
}

export type DashboardPageState =
    | DashboardPageSuccessState
    | ILoadingState
    | IErrorState
    | IPermissionErrorState;
