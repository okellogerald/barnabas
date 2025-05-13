import { useState, useCallback } from "react";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Envelope, Member } from "@/models";
import { useAppNavigation } from "@/app";
import { EnvelopeQueries } from "@/data/envelope";

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