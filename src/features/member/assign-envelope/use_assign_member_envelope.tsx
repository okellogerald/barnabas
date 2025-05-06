// import { useState, useCallback } from "react";
// import { mapQueriesToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
// import { Member, Envelope } from "@/models";
// import { useNavigate } from "react-router-dom";
// import { MemberQueries } from "../queries";
// import { EnvelopeQueries } from "@/features/envelope";
// import { useQueries } from "@tanstack/react-query";
// import { QueryKeys } from "@/lib/query";

// // Custom success state for member envelope assignment
// export class MemberAssignEnvelopeSuccessState extends SuccessState<{
//     member: Member;
//     availableEnvelopes: Envelope[];
// }> {
//     readonly member: Member;
//     readonly availableEnvelopes: Envelope[];
//     readonly isAssigning: boolean;
//     readonly selectedEnvelopeId: string | null;

//     constructor(args: {
//         data: {
//             member: Member;
//             availableEnvelopes: Envelope[];
//         };
//         isAssigning: boolean;
//         selectedEnvelopeId: string | null;
//         actions: {
//             refresh: () => void;
//             assign: (envelopeId: string) => Promise<void>;
//             selectEnvelope: (envelopeId: string | null) => void;
//             cancel: () => void;
//         };
//     }) {
//         super(args.data, { refresh: args.actions.refresh });
//         this.member = args.data.member;
//         this.availableEnvelopes = args.data.availableEnvelopes;
//         this.isAssigning = args.isAssigning;
//         this.selectedEnvelopeId = args.selectedEnvelopeId;
//         this._assign = args.actions.assign;
//         this._selectEnvelope = args.actions.selectEnvelope;
//         this._cancel = args.actions.cancel;
//     }

//     private _assign: (envelopeId: string) => Promise<void>;
//     private _selectEnvelope: (envelopeId: string | null) => void;
//     private _cancel: () => void;

//     assign(envelopeId: string): Promise<void> {
//         return this._assign(envelopeId);
//     }

//     selectEnvelope(envelopeId: string | null): void {
//         this._selectEnvelope(envelopeId);
//     }

//     cancel(): void {
//         this._cancel();
//     }

//     static is(state: any): state is MemberAssignEnvelopeSuccessState {
//         return (
//             state.type === UI_STATE_TYPE.SUCCESS &&
//             "member" in state &&
//             "availableEnvelopes" in state
//         );
//     }
// }

// // Main hook for member envelope assignment
// export const useMemberAssignEnvelope = (memberId: string) => {
//     const navigate = useNavigate();
//     const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
//     const assignMutation = EnvelopeQueries.useAssign();

//     // Combined queries
//     const [memberQuery, envelopesQuery] = useQueries({
//         queries: [
//             {
//                 ...MemberQueries.useDetail(memberId),
//                 queryKey: QueryKeys.Members.detail(memberId),
//             },
//             {
//                 ...EnvelopeQueries.useAvailable(),
//                 queryKey: QueryKeys.Envelopes.available(),
//             }
//         ]
//     });

//     // Handle assign envelope
//     const handleAssign = useCallback(async (envelopeId: string) => {
//         if (!memberId || !envelopeId) return;

//         try {
//             await assignMutation.mutateAsync({
//                 envelopeId: envelopeId,
//                 memberId: memberId
//             });

//             // Navigate back to member details
//             navigate(`/members/${memberId}`);
//         } catch (error) {
//             console.error('Failed to assign envelope:', error);
//             throw error;
//         }
//     }, [memberId, assignMutation, navigate]);

//     // Handle cancel
//     const handleCancel = useCallback(() => {
//         navigate(`/members/${memberId}`);
//     }, [memberId, navigate]);

//     return mapQueriesToAsyncState(
//         ([memberQuery, envelopesQuery] as const),
//         {
//             loadingMessage: "Loading member information...",
//             onSuccess: ([member, availableEnvelopes]) => {
//                 return new MemberAssignEnvelopeSuccessState({
//                     data: {
//                         member,
//                         availableEnvelopes: availableEnvelopes || [],
//                     },
//                     isAssigning: assignMutation.isPending,
//                     selectedEnvelopeId,
//                     actions: {
//                         refresh: () => {
//                             memberQuery.refetch();
//                             envelopesQuery.refetch();
//                         },
//                         assign: handleAssign,
//                         selectEnvelope: setSelectedEnvelopeId,
//                         cancel: handleCancel,
//                     }
//                 });
//             }
//         }
//     );
// };
// src/features/envelope/envelope-assign/use_envelope_assign.tsx
import { useState, useCallback } from "react";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Envelope, Member } from "@/models";
import { useAppNavigation } from "@/app";
import { EnvelopeQueries } from "@/features/envelope";

// Custom success state for envelope assignment
export class EnvelopeAssignSuccessState extends SuccessState<Envelope> {
    readonly envelope: Envelope;
    readonly isAssigning: boolean;
    readonly selectedMember: Member | null;
    readonly memberSelectorVisible: boolean;

    constructor(args: {
        data: {
            envelope: Envelope;
        };
        isAssigning: boolean;
        selectedMember: Member | null;
        memberSelectorVisible: boolean;
        actions: {
            refresh: () => void;
            assign: () => Promise<void>;
            selectMember: (member: Member | null) => void;
            showMemberSelector: () => void;
            hideMemberSelector: () => void;
            cancel: () => void;
        };
    }) {
        super(args.data.envelope, { refresh: args.actions.refresh });
        this.envelope = args.data.envelope;
        this.isAssigning = args.isAssigning;
        this.selectedMember = args.selectedMember;
        this.memberSelectorVisible = args.memberSelectorVisible;
        this._assign = args.actions.assign;
        this._selectMember = args.actions.selectMember;
        this._showMemberSelector = args.actions.showMemberSelector;
        this._hideMemberSelector = args.actions.hideMemberSelector;
        this._cancel = args.actions.cancel;
    }

    private _assign: () => Promise<void>;
    private _selectMember: (member: Member | null) => void;
    private _showMemberSelector: () => void;
    private _hideMemberSelector: () => void;
    private _cancel: () => void;

    assign(): Promise<void> {
        return this._assign();
    }

    selectMember(member: Member | null): void {
        this._selectMember(member);
    }

    showMemberSelector(): void {
        this._showMemberSelector();
    }

    hideMemberSelector(): void {
        this._hideMemberSelector();
    }

    cancel(): void {
        this._cancel();
    }

    static is(state: any): state is EnvelopeAssignSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "envelope" in state &&
            "selectedMember" in state &&
            "memberSelectorVisible" in state
        );
    }
}

// Main hook for envelope assignment
export const useEnvelopeAssign = (id: string) => {
    const navigate = useAppNavigation();
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberSelectorVisible, setMemberSelectorVisible] = useState(false);
    const assignMutation = EnvelopeQueries.useAssign();

    // Envelope query
    const envelopeQuery = EnvelopeQueries.useDetail(id);

    // Handle assign envelope
    const handleAssign = useCallback(async () => {
        if (!id || !selectedMember) return;

        try {
            await assignMutation.mutateAsync({
                envelopeId: id,
                memberId: selectedMember.id
            });
            navigate.Envelopes.toDetails(id);
        } catch (error) {
            console.error('Failed to assign envelope:', error);
            throw error;
        }
    }, [id, selectedMember, assignMutation, navigate]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        navigate.Envelopes.toDetails(id);
    }, [id, navigate]);

    // Show member selector
    const showMemberSelector = useCallback(() => {
        setMemberSelectorVisible(true);
    }, []);

    // Hide member selector
    const hideMemberSelector = useCallback(() => {
        setMemberSelectorVisible(false);
    }, []);

    // Handle member selection
    const handleSelectMember = useCallback((member: Member | null) => {
        setSelectedMember(member);
        setMemberSelectorVisible(false);
    }, []);

    // Map the query to our AsyncState pattern
    return mapQueryToAsyncState(envelopeQuery, {
        loadingMessage: "Loading envelope...",
        onSuccess: (envelope) => {
            return new EnvelopeAssignSuccessState({
                data: {
                    envelope
                },
                isAssigning: assignMutation.isPending,
                selectedMember,
                memberSelectorVisible,
                actions: {
                    refresh: () => {
                        envelopeQuery.refetch();
                    },
                    assign: handleAssign,
                    selectMember: handleSelectMember,
                    showMemberSelector,
                    hideMemberSelector,
                    cancel: handleCancel,
                }
            });
        }
    });
};