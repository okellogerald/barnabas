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
export class MemberDetailsLoadingState extends MemberDetailsBaseState {
    message?: string;

    constructor(message?: string) {
        super(UI_STATE_TYPE.loading);
        this.message = message;
    }
}

// Error state class
export class MemberDetailsErrorState extends MemberDetailsBaseState {
    constructor(
        public error: string,
        public actions: {
            retry: () => Promise<void>;
        },
    ) {
        super(UI_STATE_TYPE.error);
    }
}

// Success state class
export class MemberDetailsSuccessState extends MemberDetailsBaseState {
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

// Union type for all possible states
export type MemberDetailsUIState =
    | MemberDetailsLoadingState
    | MemberDetailsErrorState
    | MemberDetailsSuccessState;
