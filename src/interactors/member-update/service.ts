import { notifyUtils } from "@/utilities/notification.utils";
import {
    MemberUpdateFormSchema,
    MemberUpdateFormValues,
} from "./schemas/schemas.member";
import { MEMBER_NOTIFICATIONS } from "@/constants/member";
import { MemberManager } from "@/managers/member";
import { Navigation } from "@/app";

export const memnberUpdateService = {
    submitForm: async (formValues: MemberUpdateFormValues) => {
        const result = MemberUpdateFormSchema.safeParse(formValues);
        if (!result.success) {
            console.log(result.error);
            notifyUtils.error(
                "Please complete all required fields with valid data",
            );
            return;
        }

        const toastId = notifyUtils.showLoading(
            MEMBER_NOTIFICATIONS.CREATE.LOADING,
        );
        try {
            await MemberManager.instance.createMember(result.data);
            notifyUtils.dismiss(toastId);
            Navigation.Members.toList();
        } catch (error) {
            notifyUtils.dismiss(toastId);
            notifyUtils.apiError(error);
        }
    },
};
