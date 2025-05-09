import { useCallback } from "react";
import {
    mapQueryToAsyncState,
    StateFactory,
    SuccessState,
    UI_STATE_TYPE,
} from "@/lib/state";
import { VolunteerOpportunity } from "@/models";
import { VolunteerQueries } from "../volunteer.queries";
import {
    CreateVolunteerOpportunityDTO,
    UpdateVolunteerOpportunityDTO,
} from "@/data/volunteer";
import { useAppNavigation } from "@/app";

/**
 * Extended success state for volunteer opportunity detail view
 * Includes data about the opportunity and actions for updating/deleting
 */
export class VolunteerOpportunitySuccessState
    extends SuccessState<VolunteerOpportunity> {
    readonly isUpdating: boolean;
    readonly isDeleting: boolean;

    constructor(args: {
        data: VolunteerOpportunity;
        isUpdating: boolean;
        isDeleting: boolean;
        actions: {
            refresh: () => void;
            update: (
                data: UpdateVolunteerOpportunityDTO,
            ) => Promise<VolunteerOpportunity>;
            delete: () => Promise<void>;
            goBack: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.isUpdating = args.isUpdating;
        this.isDeleting = args.isDeleting;
        this._update = args.actions.update;
        this._delete = args.actions.delete;
        this._goBack = args.actions.goBack;
    }

    private _update: (
        data: UpdateVolunteerOpportunityDTO,
    ) => Promise<VolunteerOpportunity>;
    private _delete: () => Promise<void>;
    private _goBack: () => void;

    update(data: UpdateVolunteerOpportunityDTO): Promise<VolunteerOpportunity> {
        return this._update(data);
    }

    async delete(): Promise<void> {
        await this._delete();
        this._goBack();
    }

    goBack(): void {
        this._goBack();
    }

    static is(state: any): state is VolunteerOpportunitySuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "isUpdating" in state &&
            "isDeleting" in state
        );
    }
}

/**
 * Hook for managing a single volunteer opportunity
 * Provides data fetching and CRUD operations
 */
export function useVolunteerOpportunity(id?: string) {
    const navigate = useAppNavigation();

    // Mutation hooks
    const updateMutation = VolunteerQueries.useUpdate();
    const deleteMutation = VolunteerQueries.useDelete();

    // Query hook - only enabled if ID is provided
    const opportunityQuery = VolunteerQueries.useDetail(id || "");

    // Handle updating opportunity
    const handleUpdate = useCallback(
        async (data: UpdateVolunteerOpportunityDTO) => {
            if (!id) {
                return Promise.reject(new Error("No opportunity ID provided"));
            }

            try {
                const updated = await updateMutation.mutateAsync({
                    id,
                    data,
                });
                return updated;
            } catch (error) {
                console.error("Failed to update opportunity:", error);
                throw error;
            }
        },
        [id, updateMutation],
    );

    // Handle deleting opportunity
    const handleDelete = useCallback(async () => {
        if (!id) return Promise.reject(new Error("No opportunity ID provided"));

        try {
            await deleteMutation.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete opportunity:", error);
            throw error;
        }
    }, [id, deleteMutation]);

    // If no ID is provided, return idle state
    if (!id) {
        return StateFactory.idle();
    }

    // Map query to AsyncState
    return mapQueryToAsyncState(opportunityQuery, {
        loadingMessage: "Loading volunteer opportunity...",
        resourceType: "Volunteer Opportunity",
        resourceId: id,
        onSuccess: (data) => {
            return new VolunteerOpportunitySuccessState({
                data,
                isUpdating: updateMutation.isPending,
                isDeleting: deleteMutation.isPending,
                actions: {
                    refresh: () => opportunityQuery.refetch(),
                    update: handleUpdate,
                    delete: handleDelete,
                    goBack: () => navigate.Opportunities.toList(),
                },
            });
        },
    });
}

/**
 * Hook for creating a new volunteer opportunity
 */
export function useCreateVolunteerOpportunity() {
    const navigate = useAppNavigation();
    const createMutation = VolunteerQueries.useCreate();

    const handleCreate = useCallback(
        async (data: CreateVolunteerOpportunityDTO) => {
            try {
                const created = await createMutation.mutateAsync(data);
                navigate.Opportunities.toDetails(created.id);
                return created;
            } catch (error) {
                console.error("Failed to create opportunity:", error);
                throw error;
            }
        },
        [createMutation, navigate],
    );

    return {
        isCreating: createMutation.isPending,
        create: handleCreate,
    };
}
