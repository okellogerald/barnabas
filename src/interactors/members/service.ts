import { MemberQueryParams } from "@/data/member";
import { Member } from "../../models/member";
import { MemberManager } from "@/managers/member";
import { AppConfig } from "@/app";

export const MEMBERS_RESULTS_PER_PAGE = AppConfig.DEFAULT_PAGE_SIZE;

export const fetchInitialMembers = async (props: {
    fellowshipId?: string;
    baptized?: boolean;
    attendsFellowship?: boolean;
    search?: string;
}): Promise<{ members: Member[]; total: number }> => {
    let args: MemberQueryParams = {
        rangeStart: 0,
        rangeEnd: MEMBERS_RESULTS_PER_PAGE - 1,
        fellowshipId: props.fellowshipId,
        baptized: props.baptized,
        attendsFellowship: props.attendsFellowship,
        search: props.search,
        eager: "fellowship,interests",
        sortBy: "firstName",
        sortOrder: "asc",
    };
    const { members, total } = await MemberManager.instance.getMembers(
        args,
    );
    return { members, total };
};

export const fetchMoreMembers = async (
    args: {
        fellowshipId?: string;
        baptized?: boolean;
        attendsFellowship?: boolean;
        search?: string;
        currPage: number;
        nextPage: number;
        total: number;
    },
): Promise<Member[]> => {
    let rangeStart = args.currPage * MEMBERS_RESULTS_PER_PAGE;
    let rangeEnd = (args.nextPage * MEMBERS_RESULTS_PER_PAGE) - 1;

    // Check if we're already past the end of the list
    // This shouldn't happen as Antd Table takes care of setting the number of pages according to
    // the total number of results fed into it
    if (rangeStart > (args.total - 1)) return [];

    let query: MemberQueryParams = {
        rangeStart,
        rangeEnd,
        fellowshipId: args.fellowshipId,
        baptized: args.baptized,
        attendsFellowship: args.attendsFellowship,
        search: args.search,
        eager: "fellowship,interests",
        sortBy: "firstName",
        sortOrder: "asc",
    };

    const { members } = await MemberManager.instance.getMembers(query);
    return members;
};
