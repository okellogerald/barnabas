import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { notifyUtils } from "@/utilities/notification.utils";
import { memberEditService } from "./service";

// Import custom form hooks
import { usePersonalFields } from "./_field_hooks/use_personal_fields";
import { useMaritalFields } from "./_field_hooks/use_marital_fields";
import { useContactFields } from "./_field_hooks/use_contact_fields";
import { useChurchFields } from "./_field_hooks/use_church_fields";
import { useProfessionalFields } from "./_field_hooks/use_professional_fields";
import { useDependantFields } from "./_field_hooks/use_dependants_fields";
import { useInterestFields } from "./_field_hooks/use_interests_fields";
import { STEPS } from "./stores/store.ui";
import { useMemberEditUIStore } from "./stores/store.ui";
import { useStore } from "zustand";
import { MEMBER_NOTIFICATIONS } from "@/constants/member";
import { FormSectionKey } from "./types";
import { MemberEditFormValues, validateSection } from "./schemas/schemas.member";
import { useParams } from "react-router-dom";
import { Member } from "@/models";
import { Navigation } from "@/app";
import { MemberManager } from "@/data/member";

// Define the interface for section update data
interface SectionUpdateData {
  id?: string;
  section: FormSectionKey;
  data: any;
}

/**
 * Result of the member edit hook
 */
export interface UseMemberEditResult {
  // UI state from store
  ui: {
    currentStep: number;
    steps: typeof STEPS;
    loading: boolean;
  };

  member: Member | null;

  // Form instances and fields for each section
  personal: ReturnType<typeof usePersonalFields>;
  marital: ReturnType<typeof useMaritalFields>;
  contact: ReturnType<typeof useContactFields>;
  church: ReturnType<typeof useChurchFields>;
  professional: ReturnType<typeof useProfessionalFields>;
  dependant: ReturnType<typeof useDependantFields>;
  interest: ReturnType<typeof useInterestFields>;

  // Data loading state
  loading: boolean;
  error: string | null;

  // Actions
  actions: {
    // Navigation
    previousStep: () => void;
    goToStep: (step: number) => void;
    navigateToMemberDetails: () => void;

    // Form actions
    submit: () => Promise<void>;
    saveCurrentSection: () => Promise<void>;
  };
}

/**
 * Hook for managing the member editing process
 * Integrates all section-specific hooks and uses the UI store for step management
 * 
 * @param memberId The ID of the member to edit
 */
export const useMemberEdit = (): UseMemberEditResult => {
  const { id: memberId } = useParams<{ id: string }>();

  // State for data loading
  const [error] = useState<string | null>(null);

  // Get UI state from store
  const uiStore = useStore(useMemberEditUIStore);


  // Query to fetch member data
  const { data, isLoading } = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => MemberManager.instance.getMemberByID(memberId || ''),
    enabled: !!memberId,
    retry: 1,
  });

  // Initialize section hooks with member data
  const personal = usePersonalFields(data);
  const marital = useMaritalFields(data);
  const contact = useContactFields(data);
  const church = useChurchFields(data);
  const professional = useProfessionalFields(data);
  const dependant = useDependantFields(data);
  const interest = useInterestFields(data);

  // Create mutation for form submission
  const submitMutation = useMutation<Member | undefined, Error, MemberEditFormValues>({
    mutationKey: ["member-edit"],
    mutationFn: (data) => memberEditService.submitForm(memberId ?? "", data),
    onSuccess: (member) => {
      if (member) {
        notifyUtils.success(MEMBER_NOTIFICATIONS.EDIT.SUCCESS);
        Navigation.Members.toList()
      }
    }
  });

  // Create mutation for section update
  const sectionMutation = useMutation<Member | undefined, Error, SectionUpdateData>({
    mutationKey: ["member-edit-section"],
    mutationFn: (data) => memberEditService.updateSection(memberId ?? "", data),
    onSuccess: (member) => {
      if (member) {
        uiStore.nextStep()
        // if dependants are updated, save the new dependants info
        dependant.dependants.setInitial(member.dependants)
      }
    }
  });

  // Create a function to get form values for the current section
  const getCurrentSectionValues = useCallback(() => {
    const currentStepKey = uiStore.getCurrentStepKey();
    switch (currentStepKey) {
      case 'personal':
        return personal.form.getFieldsValue();
      case 'marital':
        return marital.form.getFieldsValue();
      case 'contact':
        return contact.form.getFieldsValue();
      case 'church':
        return church.form.getFieldsValue();
      case 'professional':
        return professional.form.getFieldsValue();
      case 'dependants':
        return {
          dependants: dependant.dependants.getUpdatedOldDependants(),
          addDependants: dependant.dependants.getNewlyAdded(),
          removeDependantIds: dependant.dependants.getDeletedDepsIds(),
        };
      case 'interests':
        return interest.form.getFieldsValue();
      default:
        return {};
    }
  }, [uiStore, personal.form, marital.form, contact.form, church.form, professional.form, dependant.dependants, interest.form]);

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

      // Dependants information
      dependants: dependant.dependants.getUpdatedOldDependants(),
      addDependants: dependant.dependants.getNewlyAdded(),
      removeDependantIds: dependant.dependants.getDeletedDepsIds(),

      // Interests Information
      ...interest.form.getFieldsValue(),
    };
  }, [memberId, personal.form, marital.form, contact.form, church.form, professional.form, dependant.dependants, interest.form]);

  // Save the current section
  const saveCurrentSection = useCallback(async (): Promise<void> => {
    const currentStepKey = uiStore.getCurrentStepKey();

    try {
      // Validate the current form based on section
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

      // Validate form fields
      if (currentForm) {
        await currentForm.validateFields();
      } else if (currentStepKey === 'dependants') {
        // For dependants, no form validation needed as the data is already in the state
      }

      // Get the current section values
      const sectionData = {
        id: memberId,
        section: currentStepKey,
        data: getCurrentSectionValues()
      };

      // Update the section
      await sectionMutation.mutateAsync(sectionData);
    } catch (error) {
      console.error('Section save failed:', error);
      notifyUtils.error(`Failed to save ${currentStepKey} section changes`);
      throw error;
    }
  }, [
    uiStore,
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    interest.form,
    memberId,
    getCurrentSectionValues,
    sectionMutation
  ]);

  const navigateToMemberDetails = useCallback((): void => {
    if (memberId) {
      Navigation.Members.toDetails(memberId);
    } else {
      notifyUtils.error("Member ID is not available for navigation");
    }
  }, [memberId])

  // Submit the form
  const submit = useCallback(async (): Promise<void> => {
    try {
      // Validate all forms
      await Promise.all([
        personal.form.validateFields(),
        marital.form.validateFields(),
        contact.form.validateFields(),
        church.form.validateFields(),
        professional.form.validateFields(),
        interest.form.validateFields(),
      ]);

      const validPersonalInfo = validateSection(personal.form.getFieldsValue(), "personal")
      const validMaritalInfo = validateSection(marital.form.getFieldsValue(), "marital")
      const validContactInfo = validateSection(contact.form.getFieldsValue(), "contact")
      const validChurchInfo = validateSection(church.form.getFieldsValue(), "church")
      const validProfessionalInfo = validateSection(professional.form.getFieldsValue(), "professional")
      const validInterestsInfo = validateSection(interest.form.getFieldsValue(), "interests")

      if (!validPersonalInfo || !validMaritalInfo || !validContactInfo || !validChurchInfo || !validProfessionalInfo || !validInterestsInfo) {
        notifyUtils.error("Please correct all errors before submitting the form");
        return;
      }

      // Get combined form values
      const formData = getFormValues();

      // Show loading notification
      const toastId = notifyUtils.showLoading(MEMBER_NOTIFICATIONS.EDIT.LOADING);

      try {
        // Submit data
        await submitMutation.mutateAsync(formData);
        notifyUtils.dismiss(toastId);
        navigateToMemberDetails();
      } catch (error) {
        notifyUtils.dismiss(toastId);
        notifyUtils.error(error);
        throw error;
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      notifyUtils.error('Please correct all errors before submitting the form');
    }
  }, [
    personal.form,
    marital.form,
    contact.form,
    church.form,
    professional.form,
    interest.form,
    getFormValues,
    submitMutation
  ]);

  return {
    // UI state from store
    ui: {
      currentStep: uiStore.currentStep,
      steps: STEPS,
      loading: submitMutation.isPending || sectionMutation.isPending,
    },

    member: data ? Member.fromDTO(data) : null,

    // Section hooks
    personal,
    marital,
    contact,
    church,
    professional,
    dependant,
    interest,

    // Data loading state
    loading: isLoading,
    error,

    // Actions
    actions: {
      previousStep: uiStore.previousStep,
      goToStep: uiStore.setCurrentStep,
      submit,
      saveCurrentSection,
      navigateToMemberDetails,
    }
  };
};