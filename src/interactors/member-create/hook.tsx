import { Form, message } from "antd";
import dayjs from "dayjs";
import { StepDefinition } from "./types";
import { usePersonalInfoStore } from "./stores/store.personal";
import { useMaritalInfoStore } from "./stores/store.marital";
import { useContactInfoStore } from "./stores/store.contact";
import { useChurchInfoStore } from "./stores/store.church";
import { useProfessionalInfoStore } from "./stores/store.professional";
import { DependantsActions, DependantsState, useDependantsStore } from "./stores/store.dependants";
import { InterestsActions, InterestsState, useInterestsStore } from "./stores/store.interests";
import { useMemberCreateUIStore, STEPS } from "./stores/store.ui";

// Import schemas
import { PersonalInfoSchema } from "./schemas/schemas.personal";
import { MaritalInfoSchema } from "./schemas/schemas.marital";
import { ContactInfoSchema } from "./schemas/schemas.contact";
import { ChurchInfoSchema } from "./schemas/schemas.church";
import { ProfessionalInfoSchema } from "./schemas/schemas.professional";

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
} from "./fields";
import { SchemaFormBuilder } from "@/components/form/schema_based";
import { validateSection, MemberFormSubmission, MemberFormValues } from "./schemas/schemas.member";

import { personalFields } from "./fields/fields.personal"

/**
 * Result of the member create hook
 */
export interface UseMemberCreateResult {
    // Form instance
    form: ReturnType<typeof Form.useForm<MemberFormValues>>[0];

    // UI state and actions
    ui: {
        currentStep: number;
        loading: boolean;
        error?: string;
        success: boolean;
        steps: StepDefinition[];
    };

    // Schema builders
    schemaBuilders: {
        personal: SchemaFormBuilder<typeof PersonalInfoSchema>;
        marital: SchemaFormBuilder<typeof MaritalInfoSchema>;
        contact: SchemaFormBuilder<typeof ContactInfoSchema>;
        church: SchemaFormBuilder<typeof ChurchInfoSchema>;
        professional: SchemaFormBuilder<typeof ProfessionalInfoSchema>;
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
        getFormValues: () => MemberFormValues;
    };
}

/**
 * Hook for managing the member creation process
 * Updated to use SchemaFormBuilder
 */
export const useMemberCreate = (): UseMemberCreateResult => {
    // Create the form instance
    const [form] = Form.useForm<MemberFormValues>();

    // Get all stores
    const personalStore = usePersonalInfoStore();
    const maritalStore = useMaritalInfoStore();
    const contactStore = useContactInfoStore();
    const churchStore = useChurchInfoStore();
    const professionalStore = useProfessionalInfoStore();
    const dependantsStore = useDependantsStore();
    const interestsStore = useInterestsStore();
    const uiStore = useMemberCreateUIStore();

    // Create schema builders
    const schemaBuilders = {
        personal: new SchemaFormBuilder(PersonalInfoSchema),
        marital: new SchemaFormBuilder(MaritalInfoSchema),
        contact: new SchemaFormBuilder(ContactInfoSchema),
        church: new SchemaFormBuilder(ChurchInfoSchema),
        professional: new SchemaFormBuilder(ProfessionalInfoSchema),
    };

    // Create a function to get the combined form values
    const getFormValues = (): MemberFormValues => {
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

            // Dependants
            dependants: dependantsStore.getDependants(),

            // Interests
            interests: interestsStore.getInterests(),
        } as MemberFormValues;
    };

    // Navigate to next step with validation
    const nextStep = async (): Promise<void> => {
        try {
            // Get the current step
            const currentStepKey = uiStore.getCurrentStepKey();

            // Validate the current step's fields in the form
            await form.validateFields(
                // Get the fields for the current step from the section
                // This depends on which step we're on
            );

            // Update the store with the form values for the current step
            const formValues = form.getFieldsValue();

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
            const combinedValues = getFormValues();
            const isValid = validateSection(combinedValues, currentStepKey);

            if (!isValid) {
                message.error(`Please complete all required fields in ${currentStepKey} section`);
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
        form.resetFields();

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
        try {
            // Validate the form
            await form.validateFields();

            // Set loading state
            uiStore.setLoading(true);

            // Get combined form values
            const formValues = getFormValues();

            // Prepare data for submission by transforming dates to strings
            const submissionData: MemberFormSubmission = { ...formValues } as any;

            if (formValues.dateOfBirth) {
                submissionData.dateOfBirth = dayjs(formValues.dateOfBirth).format("YYYY-MM-DD");
            }

            if (formValues.dateOfMarriage) {
                submissionData.dateOfMarriage = dayjs(formValues.dateOfMarriage).format("YYYY-MM-DD");
            }

            // TODO: Send the data to the API
            // This would be handled by a service function
            console.log('Form values for submission:', submissionData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            message.success('Member created successfully!');

            // Update UI state
            uiStore.setSuccess(true);
            uiStore.setLoading(false);

            // Reset the form
            reset();
        } catch (error) {
            console.error('Form submission failed:', error);

            // Show error message
            message.error('Failed to create member. Please check the form and try again.');

            // Update UI state
            uiStore.setError('Failed to create member');
            uiStore.setLoading(false);
        }
    };

    return {
        form,

        ui: {
            currentStep: uiStore.currentStep,
            loading: uiStore.loading,
            error: uiStore.error,
            success: uiStore.success,
            steps: STEPS,
        },

        // Provide schema builders
        schemaBuilders,

        fields: {
          personal: personalFields,
          marital: maritalFields,
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
            getFormValues,
        },
    };
};