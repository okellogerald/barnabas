import { notifyUtils } from "@/utilities/notification.utils";
import {
    MemberFormSubmissionSchema,
    MemberFormValues,
} from "./schemas/schemas.member";
import { MEMBER_NOTIFICATIONS } from "@/constants/member";
import { MemberManager } from "@/managers/member";

export const memnberCreateService = {
    submitForm: async (formValues: MemberFormValues) => {
        const result = MemberFormSubmissionSchema.safeParse(formValues);
        if (!result.success) {
            console.log(result.error);
            notifyUtils.error(
                "Please complete all required fields with valid data",
            );
            return;
        }

        console.log(result.data)

        const toastId = notifyUtils.showLoading(
            MEMBER_NOTIFICATIONS.CREATE.LOADING,
        );
        try {
            await MemberManager.instance.createMember(result.data);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            notifyUtils.dismiss(toastId);
            notifyUtils.apiError(error);
        }
    },
};
