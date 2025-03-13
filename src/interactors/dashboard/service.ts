import { ChurchManager } from "@/managers/church/church.manager";
import { FellowshipManager } from "@/managers/fellowship/fellowship.manager";
import { MemberManager } from "@/managers/member";
import { PermissionError } from "@/utilities/errors";

export const fetchMembers = async () => {
    try {
        return MemberManager.instance.getMembers();
    } catch (error) {
        if (PermissionError.is(error)) {
            return null;
        }
        throw error;
    }
};

export const fetchFellowships = async () => {
    try {
        return FellowshipManager.instance.getFellowships();
    } catch (error) {
        if (PermissionError.is(error)) {
            return null;
        }
        throw error;
    }
};

export const fetchChurch = async () => {
    return ChurchManager.instance.getUserChurch();
};

export const fetchDashboardData = async () => {
    const result = await Promise.all([
        fetchChurch(),
        fetchMembers(),
        fetchFellowships(),
    ]);
    return {
        church: result[0],
        members: result[1],
        fellowships: result[2],
    };
};
