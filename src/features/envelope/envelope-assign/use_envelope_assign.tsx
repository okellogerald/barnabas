import { useState, useCallback } from "react";
import { mapQueriesToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Envelope, Member } from "@/models";
import { EnvelopeQueries } from "../queries";
import { useNavigate } from "react-router-dom";
import { MemberQueries } from "@/features/member";
import { useQueries } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query";

// Custom success state for envelope assignment
export class EnvelopeAssignSuccessState extends SuccessState<{
    envelope: Envelope;
    availableMembers: Member[];
}> {
    readonly envelope: Envelope;
    readonly availableMembers: Member[];
    readonly isAssigning: boolean;
    readonly selectedMemberId: string | null;

    constructor(args: {
        data: {
            envelope: Envelope;
            availableMembers: Member[];
        };
        isAssigning: boolean;
        selectedMemberId: string | null;
        actions: {
            refresh: () => void;
            assign: (memberId: string) => Promise<void>;
            selectMember: (memberId: string | null) => void;
            cancel: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.envelope = args.data.envelope;
        this.availableMembers = args.data.availableMembers;
        this.isAssigning = args.isAssigning;
        this.selectedMemberId = args.selectedMemberId;
        this._assign = args.actions.assign;
        this._selectMember = args.actions.selectMember;
        this._cancel = args.actions.cancel;
    }

    private _assign: (memberId: string) => Promise<void>;
    private _selectMember: (memberId: string | null) => void;
    private _cancel: () => void;

    assign(memberId: string): Promise<void> {
        return this._assign(memberId);
    }

    selectMember(memberId: string | null): void {
        this._selectMember(memberId);
    }

    cancel(): void {
        this._cancel();
    }

    static is(state: any): state is EnvelopeAssignSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "envelope" in state &&
            "availableMembers" in state
        );
    }
}

// Main hook for envelope assignment
export const useEnvelopeAssign = (id: string) => {
    const navigate = useNavigate();
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const assignMutation = EnvelopeQueries.useAssign();

    // Combined queries
    const [envelopeQuery, membersQuery] = useQueries({
        queries: [
            {
                ...EnvelopeQueries.useDetail(id),
                queryKey: QueryKeys.Envelopes.detail(id),
            },
            {
                ...MemberQueries.useList({
                    filter: { envelopeNumber: null }
                }),
                queryKey: QueryKeys.Members.list(/* { envelopeNumber: null } */),
            }
        ]
    });

    // Handle assign envelope
    const handleAssign = useCallback(async (memberId: string) => {
        if (!id || !memberId) return;

        try {
            await assignMutation.mutateAsync({ envelopeId: id, memberId });
            navigate(`/envelopes/${id}`);
        } catch (error) {
            console.error('Failed to assign envelope:', error);
            throw error;
        }
    }, [id, assignMutation, navigate]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        navigate(`/envelopes/${id}`);
    }, [id, navigate]);

    // Combine queries to create a single state
    return mapQueriesToAsyncState(
        ([envelopeQuery, membersQuery] as const),
        {
            loadingMessage: "Loading envelope assignment...",
            onSuccess: ([envelope, membersData]) => {
                return new EnvelopeAssignSuccessState({
                    data: {
                        envelope,
                        availableMembers: membersData.results || [],
                    },
                    isAssigning: assignMutation.isPending,
                    selectedMemberId,
                    actions: {
                        refresh: () => {
                            envelopeQuery.refetch();
                            membersQuery.refetch();
                        },
                        assign: handleAssign,
                        selectMember: setSelectedMemberId,
                        cancel: handleCancel,
                    }
                });
            }
        }
    );
};