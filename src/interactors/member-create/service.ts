import { notifyUtils } from "@/utilities/notification.utils";
import {
    GeneralMemberFormSubmissionSchema,
    GeneralMemberFormValues,
    MemberFormSubmissionValues,
} from "./schemas/schemas.member";
import { MEMBER_NOTIFICATIONS } from "@/constants/member";
import { MemberManager } from "@/managers/member";
import { useDependantsStore } from "./stores/store.dependants";
import { useInterestsStore } from "./stores/store.interests";

export const memnberCreateService = {
    submitForm: async (formValues: GeneralMemberFormValues) => {
        const result = GeneralMemberFormSubmissionSchema.safeParse(formValues);
        if (!result.success) {
            notifyUtils.error(
                "Please complete all required fields with valid data",
            );
            return;
        }

        const data: MemberFormSubmissionValues = {
            ...result.data,
            dependants: useDependantsStore.getState().dependants,
            interests: useInterestsStore.getState().interests,
        };

        console.log(result.data);
        const toastId = notifyUtils.showLoading(
            MEMBER_NOTIFICATIONS.CREATE.LOADING,
        );
        try {
            await MemberManager.instance.createMember(data);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            notifyUtils.dismiss(toastId);
        }
    },
};
