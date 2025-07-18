import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { notifyUtils } from "@/utilities/notification.utils";
import { memnberCreateService } from "./service";
import { validateSection, validateDependantSection } from "./schemas/schemas.member";

// Import custom form hooks
import { usePersonalFields } from "./_field_hooks/use_personal_fields";
import { useMaritalFields } from "./_field_hooks/use_marital_fields";
import { useContactFields } from "./_field_hooks/use_contact_fields";
import { useChurchFields } from "./_field_hooks/use_church_fields";
import { useProfessionalFields } from "./_field_hooks/use_professional_fields";
import { useDependantFields } from "./_field_hooks/use_dependants_fields";
import { useInterestFields } from "./_field_hooks/use_interests_fields";
import { MemberCreateContext, STEPS } from "./stores/store.ui";
import { useMemberCreateUIStore } from "./stores/store.ui";
import { useStore } from "zustand";
import { FormSectionKey } from "./types";
import { FellowshipManager } from "@/data/fellowship";
import { useMemberFormReset } from "./use-form-reset";
import { useAppNavigation } from "@/app";

/**
 * Result of the member create hook
 */
export interface UseMemberCreateResult {
  // UI state from store
  ui: {
    currentStepIndex: number;
    currentStepKey: FormSectionKey;
    steps: typeof STEPS;
    isSubmittingForm: boolean;
    context?: MemberCreateContext;
  };

  // Form instances and fields for each section
  personal: ReturnType<typeof usePersonalFields>;
  marital: ReturnType<typeof useMaritalFields>;
  contact: ReturnType<typeof useContactFields>;
  church: ReturnType<typeof useChurchFields>;
  professional: ReturnType<typeof useProfessionalFields>;
  dependant: ReturnType<typeof useDependantFields>;
  interest: ReturnType<typeof useInterestFields>;

  // Actions
  actions: {
    // Navigation
    nextStep: () => Promise<void>;
    previousStep: () => void;
    goToStep: (step: number) => void;

    // Form actions
    reset: () => void;
    showResetConfirmation: () => Promise<void>;
    submit: () => Promise<void>;
  };
}

/**
 * Hook for managing the member creation process
 * Integrates all section-specific hooks and uses the UI store for step management
 */
export const useMemberCreate = (): UseMemberCreateResult => {
  // Get UI state from store
  const uiStore = useStore(useMemberCreateUIStore);
  const navigation = useAppNavigation();

  // Create mutation for form submission
  const submitFormMutation = useMutation({
    mutationKey: ["member-create"],
    mutationFn: memnberCreateService.submitForm,
  });

  // Initialize section hooks
  const personal = usePersonalFields();
  const marital = useMaritalFields();
  const contact = useContactFields();
  const church = useChurchFields();
  const professional = useProfessionalFields();
  const dependant = useDependantFields();
  const interest = useInterestFields();

  // Set up form reset functionality
  const { showResetConfirmation } = useMemberFormReset({
    onReset: async () => {
      // Reset all your forms
      reset()

      // Navigate to members list
      navigation.Members.toList();
    },
    hasUnsavedChanges: () => {
      // Your custom logic to check if there are changes
      // For simplicity, you can just return true or implement your own logic
      return (
        personal.form.isFieldsTouched() ||
        marital.form.isFieldsTouched() ||
        church.form.isFieldsTouched() ||
        contact.form.isFieldsTouched() ||
        professional.form.isFieldsTouched() ||
        interest.form.isFieldsTouched()
      );
    }
  });

  // Parse URL parameters for fellowship context
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const fellowshipId = params.get('fellowshipId');

    if (fellowshipId) {
      // Initialize with fellowship context
      uiStore.setContext({
        fellowshipId,
        sourcePage: 'fellowship'
      });

      // Pre-fill the fellowship field
      church.form.setFieldValue('fellowshipId', fellowshipId);

      // Set attendsFellowship to true for better UX
      church.form.setFieldValue('attendsFellowship', true);

      // User can't change the fellowship
      church.controls.setFieldDisabled("fellowshipId", true)

      // Optionally fetch fellowship details to get the name
      // This could use an async approach, but here's a simple example:
      try {
        const fellowshipManager = FellowshipManager.instance;
        fellowshipManager.getFellowshipById(fellowshipId).then(fellowship => {
          if (fellowship) {
            uiStore.setContext({
              fellowshipId,
              fellowshipName: fellowship.name,
              sourcePage: 'fellowship'
            });
          }
        });
      } catch (error) {
        console.error("Error fetching fellowship details:", error);
      }
    }
  }, []);

  // Create a function to get combined form values
  const getFormValues = useCallback(() => {
    return {
      // Personal information
      ...personal.form.getFieldsValue(),

      // Marital information
      ...marital.form.getFieldsValue(),

      // Contact information
      ...contact.form.getFieldsValue(),

      // Church information
      ...church.form.getFieldsValue(),

      // Professional information
      ...professional.form.getFieldsValue(),

      // Interests Information
      ...interest.form.getFieldsValue(),
    };
  }, [personal.form, marital.form, contact.form, church.form, professional.form, interest.form]);

  // Navigate to next step with validation
  const nextStep = useCallback(async (): Promise<void> => {
    try {
      // Get the current step key
      const currentStepKey = uiStore.getCurrentStepKey();

      // Check for pending image uploads on personal information step
      if (currentStepKey === "personal" && personal.hasPendingImageUploads()) {
        const pendingMessage = personal.getPendingImageMessage();
        notifyUtils.error(pendingMessage || "Please save or cancel your profile image before proceeding");
        return;
      }

      // Validate the current step's fields in the appropriate form
      if (currentStepKey === "dependants") {
        const dependantValues = dependant.form.getFieldsValue();
        const valid = validateDependantSection(dependantValues);
        if (!valid) {
          await dependant.form.validateFields();
          notifyUtils.error("Please complete all required fields in Dependants section");
          return;
        }
      }
      else {
        // Validate form for current step
        let currentForm;
        switch (currentStepKey) {
          case 'personal':
            currentForm = personal.form;
            break;
          case 'marital':
            currentForm = marital.form;
            break;
          case 'contact':
            currentForm = contact.form;
            break;
          case 'church':
            currentForm = church.form;
            break;
          case 'professional':
            currentForm = professional.form;
            break;
          case 'interests':
            currentForm = interest.form;
            break;
          default:
            currentForm = null;
        }

        if (currentForm) {
          await currentForm.validateFields();
        }
      }

      // Check if the current step is valid using the combined form values
      const combinedValues = getFormValues();
      const isValid = validateSection(combinedValues, currentStepKey);

      if (!isValid) {
        notifyUtils.error(`Please complete all required fields in ${currentStepKey} section`);
        return;
      }

      // If validation passes, go to the next step
      uiStore.nextStep();
    } catch (error) {
      console.error('Validation failed:', error);
      // Error is handled by form validation itself
    }
  }, [
    uiStore,
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    dependant.form,
    interest.form,
    getFormValues
  ]);

  // Reset all forms
  const reset = useCallback((): void => {
    // Reset form instances
    personal.form.resetFields();
    marital.form.resetFields();
    contact.form.resetFields();
    church.form.resetFields();
    professional.form.resetFields();
    dependant.form.resetFields();
    interest.form.resetFields();

    // Reset UI state
    uiStore.reset();
  }, [
    uiStore,
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    dependant.form,
    interest.form
  ]);

  // Submit the form
  const submit = useCallback(async (): Promise<void> => {
    // Validate all forms
    await Promise.all([
      personal.form.validateFields(),
      marital.form.validateFields(),
      contact.form.validateFields(),
      church.form.validateFields(),
      professional.form.validateFields(),
      interest.form.validateFields(),
    ]);

    // Get combined form values
    const formData = {
      ...getFormValues(),
      dependants: dependant.dependants.items,
    };

    // Submit data
    await submitFormMutation.mutateAsync(formData);

  }, [
    uiStore,
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    interest.form,
    dependant.dependants,
    getFormValues,
    submitFormMutation
  ]);

  return {
    // UI state from store
    ui: {
      currentStepKey: uiStore.currentStepKey,
      currentStepIndex: uiStore.currentStepIndex,
      steps: uiStore.getSteps(),
      isSubmittingForm: submitFormMutation.isPending,
      context: uiStore.context,
    },

    // Section hooks
    personal,
    marital,
    contact,
    church,
    professional,
    dependant,
    interest,

    // Actions
    actions: {
      nextStep,
      previousStep: uiStore.previousStep,
      goToStep: uiStore.setCurrentStepIndex,
      reset,
      submit,
      showResetConfirmation,
    }
  };
};