import { Form } from "antd";
import { StepDefinition } from "./types";
import { usePersonalInfoStore } from "./stores/store.personal";
import { useMaritalInfoStore } from "./stores/store.marital";
import { useContactInfoStore } from "./stores/store.contact";
import { useChurchInfoStore } from "./stores/store.church";
import { useProfessionalInfoStore } from "./stores/store.professional";
import { DependantsActions, DependantsState, useDependantsStore } from "./stores/store.dependants";
import { InterestsActions, InterestsState, useInterestsStore } from "./stores/store.interests";
import { useMemberCreateUIStore, STEPS } from "./stores/store.ui";

// Import layouts
import {
    personalLayout,
    maritalLayout,
    contactLayout,
    churchLayout,
    professionalLayout,
    maritalFields,
    contactFields,
    churchFields,
    professionalFields,
    marriedMaritalFields,
} from "./fields";
import { validateSection, GeneralMemberFormValues, validateDependantSection } from "./schemas/schemas.member";

import { personalFields } from "./fields/fields.personal"
import { useStore } from "zustand";
import { DependantInfo } from "./schemas/schemas.dependants";
import { InterestInfo } from "./schemas/schemas.interests";
import { notifyUtils } from "@/utilities/notification.utils";
import { memnberCreateService } from "./service";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { sampleMember } from "@/_dev/sample_member";
import { MaritalStatus } from "@/constants";

/**
 * Result of the member create hook
 */
export interface UseMemberCreateResult {
    // Form instance
    general_form: ReturnType<typeof Form.useForm<GeneralMemberFormValues>>[0];
    dependant_form: ReturnType<typeof Form.useForm<DependantInfo>>[0];
    interest_form: ReturnType<typeof Form.useForm<InterestInfo>>[0];

    // UI state and actions
    ui: {
        currentStep: number;
        loading: boolean;
        error?: string;
        success: boolean;
        steps: StepDefinition[];
    };

    fields: {
        personal: typeof personalFields,
        marital: typeof maritalFields,
        contact: typeof contactFields,
        church: typeof churchFields,
        professional: typeof professionalFields,
    }

    layouts: {
        personal: typeof personalLayout;
        marital: typeof maritalLayout;
        contact: typeof contactLayout;
        church: typeof churchLayout;
        professional: typeof professionalLayout;
    };

    // Dependants handling
    dependants: {
        items: DependantsState["dependants"];
        add: DependantsActions["addDependant"];
        update: DependantsActions["updateDependant"];
        remove: DependantsActions["removeDependant"];
        set: DependantsActions["setDependants"];
    };

    // Interests handling
    interests: {
        items: InterestsState["interests"];
        set: InterestsActions["setInterests"];
    };

    // Actions
    actions: {
        // Navigation
        nextStep: () => Promise<void>;
        previousStep: () => void;
        goToStep: (step: number) => void;

        // Form actions
        reset: () => void;
        submit: () => Promise<void>;

        // Get combined form values
        getFormValues: () => GeneralMemberFormValues;
    };
}

/**
 * Hook for managing the member creation process
 * Updated to use SchemaFormBuilder
 */
export const useMemberCreate = (): UseMemberCreateResult => {
    const mutation = useMutation({
        mutationKey: ["member-create"],
        mutationFn: memnberCreateService.submitForm,
    })

    // Create the form instance
    const [general_form] = Form.useForm<GeneralMemberFormValues>();
    const [dependant_form] = Form.useForm<DependantInfo>();
    const [interest_form] = Form.useForm<InterestInfo>();

    // Get all stores
    const personalStore = useStore(usePersonalInfoStore);
    const maritalStore = useStore(useMaritalInfoStore);
    const contactStore = useStore(useContactInfoStore);
    const churchStore = useStore(useChurchInfoStore);
    const professionalStore = useStore(useProfessionalInfoStore);
    const dependantsStore = useStore(useDependantsStore);
    const interestsStore = useStore(useInterestsStore);
    const uiStore = useStore(useMemberCreateUIStore);

    useEffect(() => {
        general_form.setFieldsValue(sampleMember)
    }, [])

    useEffect(() => {
        if (maritalStore.maritalStatus !== MaritalStatus.Married) {
            general_form.resetFields(["dateOfMarriage", "marriageType", "marriageType", "spouseName", "spousePhoneNumber"])
        }
    }, [maritalStore.maritalStatus])

    console.log("status: ", maritalStore.maritalStatus)

    // Create a function to get the combined form values
    const getGeneralFormValues = (): GeneralMemberFormValues => {
        return {
            // Personal information
            ...personalStore.getPersonalInfo(),

            // Marital information
            ...maritalStore.getMaritalInfo(),

            // Contact information
            ...contactStore.getContactInfo(),

            // Church information
            ...churchStore.getChurchInfo(),

            // Professional information
            ...professionalStore.getProfessionalInfo(),
        } as GeneralMemberFormValues;
    };

    // Navigate to next step with validation
    const nextStep = async (): Promise<void> => {
        try {
            // Get the current step
            const currentStepKey = uiStore.getCurrentStepKey();

            // Validate the current step's fields in the form
            if (currentStepKey === "dependants") {
                const valid = validateDependantSection(dependant_form.getFieldsValue())
                if (!valid) {
                    await dependant_form.validateFields()
                    notifyUtils.error("Please complete all required fields in Dependants section")
                    return
                }
            }
            else if (currentStepKey === "interests") {
                //
            }
            else {
                await general_form.validateFields();
            }

            // Update the store with the form values for the current step
            const formValues = general_form.getFieldsValue();

            // Based on the current step, update the appropriate store
            switch (currentStepKey) {
                case 'personal':
                    personalStore.setFields(formValues);
                    break;
                case 'marital':
                    maritalStore.setFields(formValues);
                    break;
                case 'contact':
                    contactStore.setFields(formValues);
                    break;
                case 'church':
                    churchStore.setFields(formValues);
                    break;
                case 'professional':
                    professionalStore.setFields(formValues);
                    break;
            }

            // Check if the current step is valid using the combined form values
            const combinedValues = getGeneralFormValues();
            const isValid = validateSection(combinedValues, currentStepKey);

            if (!isValid) {
                notifyUtils.error(`Please complete all required fields in ${currentStepKey} section`);
                return;
            }

            // If validation passes, go to the next step
            uiStore.nextStep();
        } catch (error) {
            console.error('Validation failed:', error);
            // Validation errors are handled by the form itself
        }
    };

    // Navigate to previous step
    const previousStep = (): void => {
        uiStore.previousStep();
    };

    // Go to a specific step
    const goToStep = (step: number): void => {
        uiStore.setCurrentStep(step);
    };

    // Reset all form data
    const reset = (): void => {
        // Reset the form
        general_form.resetFields();
        dependant_form.resetFields();
        interest_form.resetFields();


        // Reset all stores
        personalStore.reset();
        maritalStore.reset();
        contactStore.reset();
        churchStore.reset();
        professionalStore.reset();
        dependantsStore.reset();
        interestsStore.reset();

        // Reset UI state
        uiStore.reset();
    };

    // Submit the form
    const submit = async (): Promise<void> => {
        // Validate the form
        await general_form.validateFields();
        console.log(general_form.getFieldsError())
        if (general_form.getFieldsError()) {
            notifyUtils.error("Please check you data and try again")
            return;
        }

        await mutation.mutateAsync(getGeneralFormValues());
    };

    return {
        general_form: general_form,
        dependant_form: dependant_form,
        interest_form: interest_form,

        ui: {
            currentStep: uiStore.currentStep,
            loading: uiStore.loading,
            error: uiStore.error,
            success: uiStore.success,
            steps: STEPS,
        },

        fields: {
            personal: personalFields,
            marital: maritalStore.maritalStatus === MaritalStatus.Married ? marriedMaritalFields : maritalFields,
            contact: contactFields,
            church: churchFields,
            professional: professionalFields,
        },

        layouts: {
            personal: personalLayout,
            marital: maritalLayout,
            contact: contactLayout,
            church: churchLayout,
            professional: professionalLayout,
        },

        dependants: {
            items: dependantsStore.dependants,
            add: dependantsStore.addDependant,
            update: dependantsStore.updateDependant,
            remove: dependantsStore.removeDependant,
            set: dependantsStore.setDependants,
        },

        interests: {
            items: interestsStore.interests,
            set: interestsStore.setInterests,
        },

        actions: {
            nextStep,
            previousStep,
            goToStep,
            reset,
            submit,
            getFormValues: getGeneralFormValues,
        },
    };
};

