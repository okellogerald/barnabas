import { useCallback, useMemo } from "react";
import { Form } from "antd";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { VolunteerOpportunity } from "@/models";
import { VolunteerQueries } from "../../data/volunteer/volunteer.queries";
import { UpdateVolunteerOpportunityDTO } from "@/data/volunteer";
import { useAppNavigation } from "@/app";

/**
 * Extended success state for volunteer opportunity detail view
 * Includes data about the opportunity and actions for managing it
 */
export class VolunteerDetailSuccessState
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

  static is(state: any): state is VolunteerDetailSuccessState {
    return (
      state.type === UI_STATE_TYPE.SUCCESS &&
      "isUpdating" in state &&
      "isDeleting" in state
    );
  }
}

/**
 * Hook for managing volunteer opportunity details and edit functionality
 *
 * @param id - The ID of the volunteer opportunity to load
 * @returns AsyncState representing the loading/error/success state of the operation
 */
export function useVolunteerDetail(id?: string) {
  const navigate = useAppNavigation();
  const [form] = Form.useForm();

  // Query hooks
  const opportunityQuery = VolunteerQueries.useDetail(id ?? "");

  // Mutation hooks
  const updateMutation = VolunteerQueries.useUpdate();
  const deleteMutation = VolunteerQueries.useDelete();

  // Handle updating opportunity
  const handleUpdate = useCallback(
    async (data: UpdateVolunteerOpportunityDTO) => {
      try {
        const updated = await updateMutation.mutateAsync({
          id: id ?? "",
          data,
        });

        // Refresh data to ensure UI is up to date
        opportunityQuery.refetch();

        return updated;
      } catch (error) {
        console.error("Failed to update opportunity:", error);
        throw error;
      }
    },
    [id, updateMutation, opportunityQuery],
  );

  // Handle deleting opportunity
  const handleDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(id ?? "");
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      throw error;
    }
  }, [id, deleteMutation]);

  // Prepare form helpers
  const formHelpers = useMemo(() => ({
    // Initialize form with opportunity data
    initializeForm: (opportunity: VolunteerOpportunity) => {
      form.setFieldsValue({
        name: opportunity.name,
        description: opportunity.description,
      });
    },

    // Reset form to initial values
    resetForm: () => {
      if (opportunityQuery.data) {
        form.setFieldsValue({
          name: opportunityQuery.data.name,
          description: opportunityQuery.data.description,
        });
      } else {
        form.resetFields();
      }
    },

    // Submit form changes
    submitForm: () => {
      form.submit();
    },

    // Get the form instance
    form,
  }), [form, opportunityQuery.data]);

  // Map query to AsyncState
  return {
    state: mapQueryToAsyncState(opportunityQuery, {
      loadingMessage: "Loading volunteer opportunity details...",
      resourceType: "Volunteer Opportunity",
      resourceId: id,
      onSuccess: (opportunity) => {
        return new VolunteerDetailSuccessState({
          data: opportunity,
          isUpdating: updateMutation.isPending,
          isDeleting: deleteMutation.isPending,
          actions: {
            refresh: () => opportunityQuery.refetch(),
            update: handleUpdate,
            delete: handleDelete,
            goBack: () => navigate.goBack(),
          },
        });
      },
    }),
    formHelpers,
  };
}
