import { notifyUtils } from "@/utilities/notification.utils";
import {
    MemberEditFormSchema,
    MemberEditFormValues,
} from "./schemas/schemas.member";
import { FormSectionKey } from "./types";
import {
    MemberEditPersonalInfo,
    MemberEditPersonalInfoSchema,
} from "./schemas/schemas.personal";
import {
    MemberEditChurchInfo,
    MemberEditEnhancedChurchInfoSchema,
} from "./schemas/schemas.church";
import {
    MemberEditContactInfo,
    MemberEditContactInfoSchema,
} from "./schemas/schemas.contact";
import {
    MemberEditInterestsInfo,
    MemberEditInterestsInfoSchema,
} from "./schemas/schemas.interests";
import {
    MemberEditMaritalInfo,
    MemberEditMaritalInfoSchemaWithRefinements,
} from "./schemas/schemas.marital";
import {
    MemberEditProfessionalInfo,
    MemberEditProfessionalInfoSchema,
} from "./schemas/schemas.professional";
import { Member } from "@/models";
import { MemberEditDependantsSchema } from "./schemas/schemas.dependants";
import { MemberManager } from "@/data/member";

interface SectionUpdateData {
    section: FormSectionKey;
    data:
        | MemberEditPersonalInfo
        | MemberEditChurchInfo
        | MemberEditContactInfo
        | MemberEditInterestsInfo
        | MemberEditMaritalInfo
        | MemberEditProfessionalInfo;
}

// Map section keys to their validation schemas and user-friendly names
const sectionValidators: Record<
    FormSectionKey,
    { schema: any; label: string }
> = {
    church: {
        schema: MemberEditEnhancedChurchInfoSchema,
        label: "church information",
    },
    contact: {
        schema: MemberEditContactInfoSchema,
        label: "contact information",
    },
    personal: {
        schema: MemberEditPersonalInfoSchema,
        label: "personal information",
    },
    professional: {
        schema: MemberEditProfessionalInfoSchema,
        label: "professional information",
    },
    marital: {
        schema: MemberEditMaritalInfoSchemaWithRefinements,
        label: "marital information",
    },
    interests: {
        schema: MemberEditInterestsInfoSchema,
        label: "interests information",
    },
    dependants: {
        schema: MemberEditDependantsSchema,
        label: "dependants information",
    },
};

export const memberEditService = {
    /**
     * Helper function to validate a specific section
     */
    validateSection: (section: FormSectionKey, data: any): boolean => {
        const validator = sectionValidators[section];

        // If no validator is defined for this section (like interests), return true
        if (!validator?.schema) return true;

        const result = validator.schema.safeParse(data);
        if (!result.success) {
            console.log(`${section} info validation error:`, result.error);
            console.log(data)
            return false;
        }
        return true;
    },

    /**
     * Submit the entire form to update a member
     */
    submitForm: async (
        memberId: string,
        formValues: MemberEditFormValues,
    ): Promise<Member | undefined> => {
        // Validate each section individually
        const invalidSections: FormSectionKey[] = [];

        // Check each section that has a schema defined
        (Object.keys(sectionValidators) as FormSectionKey[]).forEach(
            (section) => {
                // Skip sections that don't have schemas or aren't in the form values
                if (
                    !sectionValidators[section].schema || !formValues
                ) return;

                if (
                    !memberEditService.validateSection(
                        section,
                        formValues,
                    )
                ) {
                    invalidSections.push(section);
                }
            },
        );

        // If any section validations failed, notify the user
        if (invalidSections.length > 0) {
            const errorMessages = invalidSections.map(
                (section) => sectionValidators[section].label,
            ).join(", ");

            notifyUtils.error(`Please check the following: ${errorMessages}`);
            return;
        }

        try {
            // If all is well, validate the entire form with the main schema to make
            // sure we send to the server the expected form values omitting all unncessary details
            const result = MemberEditFormSchema.safeParse(formValues);
            if (!result.success) {
                console.log("Form validation error:", result.error);
                notifyUtils.error(
                    "We could not process your request. Please check your data and try again.",
                );
                return;
            }

            console.log("Submitting form data:", result.data);

            // Update the member with fully validated data
            return await MemberManager.instance.updateMember(
                memberId,
                result.data,
            );
        } catch (error) {
            console.error("Error submitting form:", error);
            throw error;
        }
    },

    /**
     * Update a specific section of member data
     */
    updateSection: async (
        memberId: string,
        data: SectionUpdateData,
    ): Promise<Member | undefined> => {
        const { section, data: sectionData } = data;

        if (!memberId) {
            notifyUtils.error("Member ID is required");
            return;
        }

        try {
            // Validate the section data
            if (!memberEditService.validateSection(section, sectionData)) {
                notifyUtils.error(
                    `Please check the ${sectionValidators[section].label}`,
                );
                return;
            }

            console.log("submitting section info:", sectionData);

            // Update the member section
            return await MemberManager.instance.updateMember(
                memberId,
                sectionData,
            );
        } catch (error) {
            console.error(`Error updating ${section} section:`, error);
            throw error;
        }
    },
};
