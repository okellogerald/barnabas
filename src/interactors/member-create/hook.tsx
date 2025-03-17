import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
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
import { STEPS } from "./stores/store.ui";
import { useMemberCreateUIStore } from "./stores/store.ui";
import { useStore } from "zustand";

/**
 * Result of the member create hook
 */
export interface UseMemberCreateResult {
  // UI state from store
  ui: {
    currentStep: number;
    loading: boolean;
    error?: string;
    success: boolean;
    steps: typeof STEPS;
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

  // Create mutation for form submission
  const mutation = useMutation({
    mutationKey: ["member-create"],
    mutationFn: memnberCreateService.submitForm,
    onSuccess: () => {
      uiStore.setSuccess(true);
      uiStore.setError(undefined);
    },
    onError: (error: any) => {
      uiStore.setSuccess(false);
      uiStore.setError(error.message || "An error occurred while submitting the form");
    }
  });

  // Initialize section hooks
  const personal = usePersonalFields();
  const marital = useMaritalFields();
  const contact = useContactFields();
  const church = useChurchFields();
  const professional = useProfessionalFields();
  const dependant = useDependantFields();
  const interest = useInterestFields();

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
    };
  }, [personal.form, marital.form, contact.form, church.form, professional.form]);

  // Navigate to next step with validation
  const nextStep = useCallback(async (): Promise<void> => {
    try {
      // Get the current step key
      const currentStepKey = uiStore.getCurrentStepKey();

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
      else if (currentStepKey === "interests") {
        // No validation needed for interests
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
      professional.form.validateFields()
    ]);

    // Get combined form values
    const formData = {
      ...getFormValues(),
      dependants: dependant.dependants.items,
      interests: interest.interests.items
    };

    // Submit data
    await mutation.mutateAsync(formData);

  }, [
    uiStore,
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    dependant.dependants,
    interest.interests,
    getFormValues,
    mutation
  ]);

  return {
    // UI state from store
    ui: {
      currentStep: uiStore.currentStep,
      loading: uiStore.loading,
      error: uiStore.error,
      success: uiStore.success,
      steps: STEPS,
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
      goToStep: uiStore.setCurrentStep,
      reset,
      submit
    }
  };
};