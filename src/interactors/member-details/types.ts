import { Member } from "@/models";
import { AsyncSuccessState } from "../_new_state";

// Success state class
export class MemberDetailsSuccessState extends AsyncSuccessState<Member> {
    constructor(
        public member: Member,
        public actions: {
            startRefresh: () => void;
            startDelete: () => void;
            goToEdit: () => void;
            goToList: () => void;
        },
    ) {
        super(member, actions);
    }
}
