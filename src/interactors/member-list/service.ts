import { Member } from "@/models/member";
import { MemberManager } from "@/managers/member";
import { notifyUtils } from "@/utilities/notification_utils";
import { memberTableStore } from "./store.table";
import { getFilterParams, memberFilterStore } from "./store.filters";
import { ErrorCategory, handleApiError } from "@/utilities/errors";
import { MEMBER_API, MEMBER_NOTIFICATIONS, PAGINATION } from "@/constants";

/**
 * Member service containing all member-related API operations.
 */
export const memberService = {
    /**
     * Fetches the initial set of members based on query parameters.
     * Initializes the member table store with the fetched data.
     *
     * @param params Optional query parameters to filter members. Defaults to current filter parameters.
     * @returns A promise resolving to an object containing the fetched members and total count.
     * @throws ApiError if the fetch operation fails.
     */
    fetchInitial: async (
        params = getFilterParams(),
    ): Promise<{ members: Member[]; total: number }> => {
        // Build query params for objection-find format
        const queryParams: any = {
            ...params,
            eager: MEMBER_API.EAGER_LOADING,
            // Pagination using range
            rangeStart: PAGINATION.DEFAULT_RANGE_START,
            rangeEnd: PAGINATION.DEFAULT_PAGE_SIZE - 1,
        };

        try {
            const { members, total } = await MemberManager.instance.getMembers(
                queryParams,
            );
            // Initialize store with fetched data
            memberTableStore.getState().init(members, total);
            return { members, total };
        } catch (error) {
            throw handleApiError(error, ErrorCategory.FETCH, {
                entity: "members",
                operation: "fetchInitialMembers",
                details: { params },
            });
        }
    },

    /**
     * Refreshes the member list with current filters.
     * Resets the member table store and fetches the initial set of members.
     *
     * @returns A promise resolving to void.
     */
    refresh: async (): Promise<void> => {
        const filters = memberFilterStore.getState().getQueryParams();
        memberTableStore.getState().reset();

        const toastId = notifyUtils.showLoading(
            MEMBER_NOTIFICATIONS.LIST.REFRESHING,
        );
        try {
            await memberService.fetchInitial(filters);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            notifyUtils.dismiss(toastId);
        }
    },

    /**
     * Fetches additional members for pagination.
     * Calculates the range parameters and fetches members based on current filters.
     *
     * @param params An object containing the current page, next page, and total results.
     * @returns A promise resolving to an array of fetched members.
     * @throws ApiError if the fetch operation fails.
     */
    fetchMore: async (
        params: {
            currPage: number;
            nextPage: number;
            total: number;
        },
    ): Promise<Member[]> => {
        // Calculate range parameters for objection-find
        let rangeStart = params.currPage * PAGINATION.DEFAULT_PAGE_SIZE;
        let rangeEnd = (params.nextPage * PAGINATION.DEFAULT_PAGE_SIZE) - 1;

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
            eager: MEMBER_API.EAGER_LOADING,
        };

        try {
            const { members } = await MemberManager.instance.getMembers(
                queryParams,
            );
            return members;
        } catch (error) {
            throw handleApiError(error, ErrorCategory.FETCH, {
                entity: "members",
                operation: "fetchMoreMembers",
                details: { params, queryParams },
            });
        }
    },

    /**
     * Handles pagination and fetching more data as needed.
     * Checks if the data for the requested page is already available and updates the store accordingly.
     *
     * @param page The page number to navigate to.
     * @returns A promise resolving to void.
     */
    handlePagination: async (
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

        const toastId = notifyUtils.showLoading(
            MEMBER_NOTIFICATIONS.LIST.LOADING_MORE,
        );

        try {
            const results = await memberService.fetchMore({
                currPage: pagination.currPage,
                nextPage: page,
                total: pagination.totalResults,
            });

            store.addToMembers(results, page);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            // Error already handled in fetchMoreMembers
            notifyUtils.dismiss(toastId);
        }
    },
};
