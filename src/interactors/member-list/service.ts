// service.ts
import { Member } from "@/models/member";
import { MemberManager } from "@/managers/member";
import { AppConfig } from "@/app";
import { notifyUtils } from "@/utilities/notification_utils";
import { memberTableStore } from "./store.table";
import { getFilterParams, memberFilterStore } from "./store.filters";

/**
 * Default number of results per page
 */
const MEMBERS_RESULTS_PER_PAGE = AppConfig.DEFAULT_PAGE_SIZE;

/**
 * Fetches the initial set of members based on query parameters
 * @param params Query parameters that match the backend model properties
 * @returns Promise resolving to members and total count
 */
export const fetchInitialMembers = async (
    params = getFilterParams(),
): Promise<{ members: Member[]; total: number }> => {
    // Build query params for objection-find format
    const queryParams: any = {
        ...params,
        eager: "fellowship",
        // Pagination using range
        rangeStart: 0,
        rangeEnd: MEMBERS_RESULTS_PER_PAGE - 1,
    };

    try {
        const { members, total } = await MemberManager.instance.getMembers(
            queryParams,
        );
        // Initialize store with fetched data
        memberTableStore.getState().init(members, total);
        return { members, total };
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
};

/**
 * Refreshes the member list with current filters
 */
export const refreshMembers = async (): Promise<void> => {
    const filters = memberFilterStore.getState().getQueryParams();
    memberTableStore.getState().reset();

    try {
        const toastId = notifyUtils.showLoading("Refreshing members...");
        await fetchInitialMembers(filters);
        notifyUtils.dismiss(toastId);
    } catch (error) {
        notifyUtils.error("Failed to refresh members");
    }
};

/**
 * Fetches additional members for pagination
 * @param params Additional parameters for pagination
 * @returns Promise resolving to additional members
 */
export const fetchMoreMembers = async (
    params: {
        currPage: number;
        nextPage: number;
        total: number;
    },
): Promise<Member[]> => {
    // Calculate range parameters for objection-find
    let rangeStart = params.currPage * MEMBERS_RESULTS_PER_PAGE;
    let rangeEnd = (params.nextPage * MEMBERS_RESULTS_PER_PAGE) - 1;

    // Check if we're already past the end of the list
    if (rangeStart > (params.total - 1)) {
        return [];
    }

    // Get current filters
    const filterParams = getFilterParams();

    // Build query params
    const queryParams: any = {
        ...filterParams,
        rangeStart,
        rangeEnd,
        eager: "fellowship",
    };

    try {
        const { members } = await MemberManager.instance.getMembers(
            queryParams,
        );
        return members;
    } catch (error) {
        console.error("Error fetching more members:", error);
        throw error;
    }
};

/**
 * Handles pagination and fetching more data as needed
 * @param page The requested page number
 */
export const handlePagination = async (
    page: number,
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

    const toastId = notifyUtils.showLoading("Loading more data...");

    try {
        const results = await fetchMoreMembers({
            currPage: pagination.currPage,
            nextPage: page,
            total: pagination.totalResults,
        });

        store.addToMembers(results, page);
        notifyUtils.dismiss(toastId);
    } catch (error) {
        console.error("Error in pagination:", error);
        notifyUtils.dismiss(toastId);
        notifyUtils.error("Failed to load more data");
    }
};
