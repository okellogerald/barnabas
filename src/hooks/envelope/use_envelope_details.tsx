import { useCallback } from "react";
import { mapQueriesToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Envelope, EnvelopeHistory } from "@/models";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query";
import { EnvelopeQueries } from "@/data/envelope";

export class EnvelopeDetailSuccessState extends SuccessState<Envelope> {
    readonly envelope: Envelope;
    readonly history: EnvelopeHistory[];
    readonly isReleasing: boolean;
    readonly isAssigning: boolean;

    constructor(args: {
        data: Envelope;
        history: EnvelopeHistory[];
        isReleasing: boolean;
        isAssigning: boolean;
        actions: {
            refresh: () => void;
            release: () => Promise<void>;
            assign: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.envelope = args.data;
        this.history = args.history;
        this.isReleasing = args.isReleasing;
        this.isAssigning = args.isAssigning;
        this._release = args.actions.release;
        this._assign = args.actions.assign;
    }

    private _release: () => Promise<void>;
    private _assign: () => void;

    release(): Promise<void> {
        return this._release();
    }

    assign(): void {
        this._assign();
    }

    static is(state: any): state is EnvelopeDetailSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "envelope" in state
        );
    }
}

export const useEnvelopeDetail = (id: string) => {
    const navigate = useNavigate();
    const releaseMutation = EnvelopeQueries.useRelease();

    // Combined queries
    const [envelopeQuery, historyQuery] = useQueries({
        queries: [
            {
                ...EnvelopeQueries.useDetail(id),
                queryKey: QueryKeys.Envelopes.detail(id),
            },
            {
                ...EnvelopeQueries.useHistory(id),
                queryKey: QueryKeys.Envelopes.history(id),
            }
        ]
    });

    const handleRelease = useCallback(async () => {
        if (!id) return;

        try {
            await releaseMutation.mutateAsync(id);
            envelopeQuery.refetch();
            historyQuery.refetch();
        } catch (error) {
            console.error('Failed to release envelope:', error);
            throw error;
        }
    }, [id, releaseMutation, envelopeQuery, historyQuery]);

    const handleAssign = useCallback(() => {
        navigate(`/envelopes/${id}/assign`);
    }, [id, navigate]);



    // Map the envelope query to state, including history data
    return mapQueriesToAsyncState(
        ([envelopeQuery, historyQuery] as const),
        {
            loadingMessage: "Loading envelope details...",
            onSuccess: ([envelope, history]) => {
                return new EnvelopeDetailSuccessState({
                    data: envelope,
                    history: history,
                    isReleasing: releaseMutation.isPending,
                    isAssigning: false,
                    actions: {
                        refresh: () => {
                            envelopeQuery.refetch();
                            historyQuery.refetch();
                        },
                        release: handleRelease,
                        assign: handleAssign,
                    }
                });
            }
        });
};