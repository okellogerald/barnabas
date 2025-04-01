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
    submitForm: async (
        memberId: string,
        formValues: MemberEditFormValues,
    ): Promise<boolean> => {
        // checking church info
        const churchInfoValidationResult = MemberEditEnhancedChurchInfoSchema
            .safeParse(formValues);
        if (!churchInfoValidationResult.success) {
            console.log(
                "submit form error: ",
                churchInfoValidationResult.error,
            );
            notifyUtils.error(
                "Please make sure your church info are valid",
            );
            return false;
        }

        // checking church info
        const maritalInfoValidationResult =
            MemberEditMaritalInfoSchemaWithRefinements
                .safeParse(formValues);
        if (!maritalInfoValidationResult.success) {
            console.log(
                "submit form error: ",
                maritalInfoValidationResult.error,
            );
            notifyUtils.error(
                "Please make sure your marital info are valid",
            );
            return false;
        }

        // Validate (other) form data
        const result = MemberEditFormSchema.safeParse(formValues);
        if (!result.success) {
            console.log("submit form error: ", result.error);
            notifyUtils.error(
                "Please complete all required fields with valid data",
            );
            return false;
        }

        try {
            // Update the member
            await MemberManager.instance.updateMember(
                memberId,
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
    updateSection: async (
        memberId: string,
        data: SectionUpdateData,
    ): Promise<boolean> => {
        const { section, data: sectionData } = data;

        if (!memberId) {
            notifyUtils.error("Member ID is required");
            return false;
        }

        try {
            if (section === "church") {
                const result = MemberEditEnhancedChurchInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    console.log("church info validation error: ", result.error);
                    notifyUtils.error("Please check the church information");
                    return false;
                }
            }
            if (section === "contact") {
                const result = MemberEditContactInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    console.log(
                        "contact info validation error: ",
                        result.error,
                    );
                    notifyUtils.error("Please check the contact information");
                    return false;
                }
            }
            if (section === "personal") {
                const result = MemberEditPersonalInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    console.log(
                        "personal info validation error: ",
                        result.error,
                    );
                    notifyUtils.error("Please check the personal information");
                    return false;
                }
            }
            if (section === "professional") {
                const result = MemberEditProfessionalInfoSchema.safeParse(
                    sectionData,
                );
                if (!result.success) {
                    console.log(
                        "professional info validation error: ",
                        result.error,
                    );
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
                    console.log(
                        "marital info validation error: ",
                        result.error,
                    );
                    notifyUtils.error("Please check the marital information");
                    return false;
                }
            }

            console.log("submitting section info: ", sectionData);

            // Update the member section
            await MemberManager.instance.updateMember(memberId, sectionData);
            return true;
        } catch (error) {
            console.error(`Error updating ${section} section:`, error);
            throw error;
        }
    },
};
