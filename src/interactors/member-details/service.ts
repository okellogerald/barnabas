import { sampleCompleteMember } from "@/_dev/sample_member";
import { MemberManager } from "@/managers/member";
import { Member } from "@/models";
import { notifyUtils } from "@/utilities/notification.utils";

export const MemberDetailsService = {
    loadMember: async (memberId?: string): Promise<Member | undefined> => {
        console.log("member id: ", memberId);
        try {
            if (!memberId) {
                throw new Error("Member ID is required");
            }

            //return sampleCompleteMember

            const member = await MemberManager.instance.getMemberByID(memberId);

            if (!member) {
                throw new Error("Member not found");
            }

            return member;
        } catch (error) {
            console.error("Error loading member:", error);
            throw error;
        }
    },

    deleteMember: async (memberId?: string) => {
        try {
            if (!memberId) {
                notifyUtils.error("Member ID is required");
                return;
            }

            const toastId = notifyUtils.showLoading("Deleting member...");

            await MemberManager.instance.deleteMember(memberId);
            notifyUtils.dismiss(toastId);
            notifyUtils.success("Member has been deleted");
        } catch (error) {
            console.error("Error deleting member:", error);
            notifyUtils.apiError(error);
        }
    },
};
