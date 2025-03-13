import { MemberQueryParams } from "@/data/member";
import { Member } from "@/models/member";
import { MemberManager } from "@/managers/member";
import { AppConfig } from "@/app";
import {
    FetchMoreParams,
    MemberListQueryParams,
    MembersQueryResult,
} from "./types";
import { notifyUtils } from "@/utilities/notification_utils";
import { createMemberTableStore } from "./store";

/**
 * Default number of results per page
 */
const MEMBERS_RESULTS_PER_PAGE = AppConfig.DEFAULT_PAGE_SIZE;

export const memberTableStore = createMemberTableStore();

/**
 * Fetches the initial set of members based on query parameters
 * @param params Query parameters for filtering members
 * @returns Promise resolving to members and total count
 */
export const fetchInitialMembers = async (
    params: MemberListQueryParams,
): Promise<MembersQueryResult> => {
    const queryParams: MemberQueryParams = {
        rangeStart: 0,
        rangeEnd: MEMBERS_RESULTS_PER_PAGE - 1,
        fellowshipId: params.fellowshipId,
        baptized: params.baptized,
        attendsFellowship: params.attendsFellowship,
        search: params.search,
        eager: "fellowship",
    };

    try {
        const { members, total } = await MemberManager.instance.getMembers(
            queryParams,
        );
        memberTableStore.getState().init(members, total);
        return { members, total };
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
};

/**
 * Fetches additional members for pagination
 * @param params Parameters including current page, next page, and filters
 * @returns Promise resolving to additional members
 */
export const fetchMoreMembers = async (
    params: FetchMoreParams,
): Promise<Member[]> => {
    await new Promise<void>((resolve) => {
        setTimeout(resolve, 3000);
    });
    let rangeStart = params.currPage * MEMBERS_RESULTS_PER_PAGE;
    let rangeEnd = (params.nextPage * MEMBERS_RESULTS_PER_PAGE) - 1;

    // Check if we're already past the end of the list
    if (rangeStart > (params.total - 1)) {
        return [];
    }

    const queryParams: MemberQueryParams = {
        rangeStart,
        rangeEnd,
        fellowshipId: params.fellowshipId,
        baptized: params.baptized,
        attendsFellowship: params.attendsFellowship,
        search: params.search,
        eager: "fellowship",
    };

    try {
        const { members } = await MemberManager.instance.getMembers(
            queryParams,
        );
        memberTableStore.getState().addToMembers(members, params.nextPage);
        return members;
    } catch (error) {
        console.error("Error fetching more members:", error);
        notifyUtils.error("Failed to load more members");
        throw error;
    }
};

/**
 * Handles pagination and fetching more data as needed
 * @param page The requested page number
 * @param queryParams Current query parameters
 */
export const handlePagination = async (
    page: number,
    queryParams: MemberListQueryParams = {},
): Promise<void> => {
    const store = memberTableStore.getState();
    const pagination = store.pagination;

    // Check if we already have the data for this page
    const cond1 = page <= pagination.currPage;
    const cond2 =
        (page * pagination.resultsPerPage) <= store.members.all.length;

    if (cond1 || cond2) {
        // We already have the data, just update the current page
        store.setCurrPage(page);
        return;
    }

    const toast_id = notifyUtils.showLoading("Loading more data...");

    try {
        const results = await fetchMoreMembers({
            ...queryParams,
            currPage: pagination.currPage,
            nextPage: page,
            total: pagination.totalResults,
        });

        store.addToMembers(results, page);
        notifyUtils.dismiss(toast_id);
        notifyUtils.success("Loaded more data!");
    } catch (error) {
        console.error("Error in pagination:", error);
        notifyUtils.dismiss(toast_id);
        notifyUtils.error("Failed to load more data");
    }
};
