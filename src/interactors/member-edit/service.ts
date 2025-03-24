import { notifyUtils } from "@/utilities/notification.utils";
import {
    MemberEditFormSchema,
    MemberEditFormValues,
} from "./schemas/schemas.member";
import { MemberManager } from "@/managers/member";
import { Navigation } from "@/app";
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
import { MemberEditInterestsInfo } from "./schemas/schemas.interests";
import {
    MemberEditMaritalInfo,
    MemberEditMaritalInfoSchemaWithRefinements,
} from "./schemas/schemas.marital";
import {
    MemberEditProfessionalInfo,
    MemberEditProfessionalInfoSchema,
} from "./schemas/schemas.professional";

interface SectionUpdateData {
    id?: string;
    section: FormSectionKey;
    data:
        | MemberEditPersonalInfo
        | MemberEditChurchInfo
        | MemberEditContactInfo
        | MemberEditInterestsInfo
        | MemberEditMaritalInfo
        | MemberEditProfessionalInfo;
}

export const memberEditService = {
    /**
     * Submit the entire form to update a member
     */
    submitForm: async (formValues: MemberEditFormValues): Promise<boolean> => {
        // Validate form data
        const result = MemberEditFormSchema.safeParse(formValues);
        if (!result.success) {
            console.log(result.error);
            notifyUtils.error(
                "Please complete all required fields with valid data",
            );
            return false;
        }

        try {
            // Update the member
            await MemberManager.instance.updateMember(
                formValues.id,
                result.data,
            );

            // Navigate to member list on success
            Navigation.Members.toList();
            return true;
        } catch (error) {
            // Error is handled by the calling component
            throw error;
        }
    },

    /**
     * Update a specific section of member data
     */
    updateSection: async (data: SectionUpdateData) => {
        const { id, section, data: sectionData } = data;

        if (!id) {
            notifyUtils.error("Member ID is required");
            return false;
        }

        try {
            // Prepare section-specific data to update
            const updateData = { id, ...sectionData };

            if (section === "church") {
                const result = MemberEditEnhancedChurchInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    notifyUtils.error("Please check the church information");
                    return false;
                }
            }
            if (section === "contact") {
                const result = MemberEditContactInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    notifyUtils.error("Please check the contact information");
                    return false;
                }
            }
            if (section === "personal") {
                const result = MemberEditPersonalInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    notifyUtils.error("Please check the personal information");
                    return false;
                }
            }
            if (section === "professional") {
                const result = MemberEditProfessionalInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    notifyUtils.error(
                        "Please check the professional information",
                    );
                    return false;
                }
            }
            if (section === "marital") {
                const result = MemberEditMaritalInfoSchemaWithRefinements
                    .safeParse(sectionData);
                if (!result.success) {
                    notifyUtils.error("Please check the marital information");
                    return false;
                }
            }

            // Update the member section
            await MemberManager.instance.updateMember(id, updateData);
            return true;
        } catch (error) {
            console.error(`Error updating ${section} section:`, error);
            throw error;
        }
    },
};
