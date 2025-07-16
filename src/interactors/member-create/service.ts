import { notifyUtils } from "@/utilities/notification.utils";
import {
    MemberCreateFormSchema,
    MemberCreateFormValues,
} from "./schemas/schemas.member";
import { MEMBER_NOTIFICATIONS } from "@/constants/member";
import { MemberManager } from "@/data/member";
import { Navigation } from "@/app";

export const memnberCreateService = {
    submitForm: async (formValues: MemberCreateFormValues) => {
        const result = MemberCreateFormSchema.safeParse(formValues);
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
            notifyUtils.error(error);
        }
    },
};
