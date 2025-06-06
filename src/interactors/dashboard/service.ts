import { ChurchManager } from "@/data/church/church.manager";
import { FellowshipManager } from "@/data/fellowship";
import { MemberManager } from "@/data/member";
import { PermissionError } from "@/lib/error";

export const fetchMembersCount = async () => {
    try {
        return MemberManager.instance.getMembersCount();
    } catch (error) {
        if (PermissionError.is(error)) {
            return null;
        }
        throw error;
    }
};

export const fetchFellowshipsCount = async () => {
    try {
        return FellowshipManager.instance.getFellowshipsCount();
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
        fetchMembersCount(),
        fetchFellowshipsCount(),
    ]);
    return {
        church: result[0],
        members: result[1],
        fellowships: result[2],
    };
};
