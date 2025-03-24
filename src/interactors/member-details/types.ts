import { Member } from "@/models";
import { UI_STATE_TYPE } from "../_state";

// Base class for member details state
export class MemberDetailsBaseState {
    type: UI_STATE_TYPE;

    constructor(type: UI_STATE_TYPE) {
        this.type = type;
    }
}

// Loading state class
export class LoadingState extends MemberDetailsBaseState {
    constructor() {
        super(UI_STATE_TYPE.loading);
    }
}

// Error state class
export class ErrorState extends MemberDetailsBaseState {
    constructor(public error: string) {
        super(UI_STATE_TYPE.error);
    }
}

// Success state class
export class SuccessState extends MemberDetailsBaseState {
    constructor(
        public member: Member,
        public actions: {
            loadMember: (memberId?: string) => Promise<void>;
            deleteMember: () => Promise<void>;
        },
    ) {
        super(UI_STATE_TYPE.success);
    }
}

// Success state for member details
export interface MemberDetailsSuccessState extends SuccessState {
    member: Member;
    actions: {
        loadMember: (memberId?: string) => Promise<void>;
        deleteMember: () => Promise<void>;
    };
}

// Union type for all possible states
export type MemberDetailsUIState =
    | LoadingState
    | ErrorState
    | MemberDetailsSuccessState;
