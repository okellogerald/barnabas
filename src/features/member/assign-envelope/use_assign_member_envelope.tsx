import { useState, useCallback } from "react";
import { mapQueriesToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Member, Envelope } from "@/models";
import { useNavigate } from "react-router-dom";
import { MemberQueries } from "../queries";
import { EnvelopeQueries } from "@/features/envelope";
import { useQueries } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query";

// Custom success state for member envelope assignment
export class MemberAssignEnvelopeSuccessState extends SuccessState<{
    member: Member;
    availableEnvelopes: Envelope[];
}> {
    readonly member: Member;
    readonly availableEnvelopes: Envelope[];
    readonly isAssigning: boolean;
    readonly selectedEnvelopeId: string | null;

    constructor(args: {
        data: {
            member: Member;
            availableEnvelopes: Envelope[];
        };
        isAssigning: boolean;
        selectedEnvelopeId: string | null;
        actions: {
            refresh: () => void;
            assign: (envelopeId: string) => Promise<void>;
            selectEnvelope: (envelopeId: string | null) => void;
            cancel: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.member = args.data.member;
        this.availableEnvelopes = args.data.availableEnvelopes;
        this.isAssigning = args.isAssigning;
        this.selectedEnvelopeId = args.selectedEnvelopeId;
        this._assign = args.actions.assign;
        this._selectEnvelope = args.actions.selectEnvelope;
        this._cancel = args.actions.cancel;
    }

    private _assign: (envelopeId: string) => Promise<void>;
    private _selectEnvelope: (envelopeId: string | null) => void;
    private _cancel: () => void;

    assign(envelopeId: string): Promise<void> {
        return this._assign(envelopeId);
    }

    selectEnvelope(envelopeId: string | null): void {
        this._selectEnvelope(envelopeId);
    }

    cancel(): void {
        this._cancel();
    }

    static is(state: any): state is MemberAssignEnvelopeSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "member" in state &&
            "availableEnvelopes" in state
        );
    }
}

// Main hook for member envelope assignment
export const useMemberAssignEnvelope = (memberId: string) => {
    const navigate = useNavigate();
    const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
    const assignMutation = EnvelopeQueries.useAssign();

    // Combined queries
    const [memberQuery, envelopesQuery] = useQueries({
        queries: [
            {
                ...MemberQueries.useDetail(memberId),
                queryKey: QueryKeys.Members.detail(memberId),
            },
            {
                ...EnvelopeQueries.useAvailable(),
                queryKey: QueryKeys.Envelopes.available(),
            }
        ]
    });

    // Handle assign envelope
    const handleAssign = useCallback(async (envelopeId: string) => {
        if (!memberId || !envelopeId) return;

        try {
            await assignMutation.mutateAsync({
                envelopeId: envelopeId,
                memberId: memberId
            });

            // Navigate back to member details
            navigate(`/members/${memberId}`);
        } catch (error) {
            console.error('Failed to assign envelope:', error);
            throw error;
        }
    }, [memberId, assignMutation, navigate]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        navigate(`/members/${memberId}`);
    }, [memberId, navigate]);

    return mapQueriesToAsyncState(
        ([memberQuery, envelopesQuery] as const),
        {
            loadingMessage: "Loading member information...",
            onSuccess: ([member, availableEnvelopes]) => {
                return new MemberAssignEnvelopeSuccessState({
                    data: {
                        member,
                        availableEnvelopes: availableEnvelopes || [],
                    },
                    isAssigning: assignMutation.isPending,
                    selectedEnvelopeId,
                    actions: {
                        refresh: () => {
                            memberQuery.refetch();
                            envelopesQuery.refetch();
                        },
                        assign: handleAssign,
                        selectEnvelope: setSelectedEnvelopeId,
                        cancel: handleCancel,
                    }
                });
            }
        }
    );
};