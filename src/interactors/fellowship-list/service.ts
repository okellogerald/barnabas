import { Fellowship } from "@/models/fellowship";
import { FellowshipManager } from "@/managers/fellowship";
import { notifyUtils } from "@/utilities/notification.utils";
import { fellowshipTableStore } from "./store.table";
import { getFilterParams, fellowshipFilterStore } from "./store.filters";
import { ErrorCategory, handleApiError } from "@/utilities/errors";
import { FELLOWSHIP_API, FELLOWSHIP_NOTIFICATIONS } from "./constants";
import { FellowshipQueryParams } from "@/data/fellowship";
import { PAGINATION } from "@/constants";

/**
 * @typedef {object} FellowshipsQueryResult
 * @property {Fellowship[]} fellowships - An array of fellowship objects.
 * @property {number} total - The total number of fellowships matching the query.
 */
export interface FellowshipsQueryResult {
    fellowships: Fellowship[];
    total: number;
}

/**
 * Fellowship service containing fellowship-related API operations.
 */
export const fellowshipService = {
    /**
     * Fetches the initial set of fellowships based on query parameters.
     * Initializes the fellowship table store with the fetched data.
     *
     * @param params Optional query parameters to filter fellowships. Defaults to current filter parameters.
     * @returns A promise resolving to an object containing the fetched fellowships and total count.
     * @throws ApiError if the fetch operation fails.
     */
    fetchInitial: async (
        params = getFilterParams(),
    ): Promise<FellowshipsQueryResult> => {
        // Build query params for objection-find format
        const queryParams: FellowshipQueryParams = {
            ...params,
            eager: FELLOWSHIP_API.EAGER_LOADING, // Use fellowship specific eager loading
            // Pagination using range
            rangeStart: PAGINATION.DEFAULT_RANGE_START,
            rangeEnd: PAGINATION.DEFAULT_PAGE_SIZE - 1,
        };

        try {
            const { fellowships, total } =
                await FellowshipManager.instance.getFellowships(queryParams);
            // Initialize store with fetched data
            fellowshipTableStore.getState().init(fellowships, total);
            return { fellowships, total };
        } catch (error) {
            throw handleApiError(error, ErrorCategory.FETCH, {
                entity: "fellowships",
                operation: "fetchInitialFellowships",
                details: { params },
            });
        }
    },

    /**
     * Refreshes the fellowship list with current filters.
     * Resets the fellowship table store and fetches the initial set of fellowships.
     *
     * @returns A promise resolving to void.
     */
    refresh: async (): Promise<void> => {
        const filters = fellowshipFilterStore.getState().getQueryParams();
        fellowshipTableStore.getState().reset();

        const toastId = notifyUtils.showLoading(
            FELLOWSHIP_NOTIFICATIONS.LIST.REFRESHING,
        );
        try {
            await fellowshipService.fetchInitial(filters);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            // Error is handled within fetchInitial via handleApiError
            notifyUtils.dismiss(toastId);
            // No need to re-throw, error notification is already shown
        }
    },

    /**
     * Fetches additional fellowships for pagination.
     * Calculates the range parameters and fetches fellowships based on current filters.
     *
     * @param params An object containing the current page, next page, and total results.
     * @returns A promise resolving to an array of fetched fellowships.
     * @throws ApiError if the fetch operation fails.
     */
    fetchMore: async (
        params: {
            currPage: number;
            nextPage: number;
            total: number;
        },
    ): Promise<Fellowship[]> => {
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
        const queryParams: FellowshipQueryParams = {
            ...filterParams,
            rangeStart,
            rangeEnd,
            eager: FELLOWSHIP_API.EAGER_LOADING, // Use fellowship specific eager loading
        };

        try {
            const { fellowships } =
                await FellowshipManager.instance.getFellowships(queryParams);
            return fellowships;
        } catch (error) {
            throw handleApiError(error, ErrorCategory.FETCH, {
                entity: "fellowships",
                operation: "fetchMoreFellowships",
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
        const store = fellowshipTableStore.getState();
        const pagination = store.pagination;

        // Prevent fetching if page is invalid or already current
        if (page < 1 || page === pagination.currPage) return;

        // Check if we already have the data for this page
        const dataAlreadyAvailable =
            (page * pagination.resultsPerPage) <= store.fellowships.all.length;

        if (dataAlreadyAvailable) {
            // We already have the data, just update the current page
            store.setCurrPage(page);
            return;
        }

        const toastId = notifyUtils.showLoading(
            FELLOWSHIP_NOTIFICATIONS.LIST.LOADING_MORE,
        );

        try {
            const results = await fellowshipService.fetchMore({
                currPage: pagination.currPage,
                nextPage: page,
                total: pagination.totalResults,
            });

            store.addToFellowships(results, page);
            notifyUtils.dismiss(toastId);
        } catch (error) {
            // Error already handled in fetchMore
            notifyUtils.dismiss(toastId);
        }
    },

    /**
     * Deletes a fellowship and refreshes the list on success.
     * @param fellowship The fellowship to delete.
     */
    deleteFellowship: async (fellowship: Fellowship): Promise<void> => {
         // Basic confirmation, consider using a modal for better UX
        if (!window.confirm(FELLOWSHIP_NOTIFICATIONS.DELETE.CONFIRM)) {
            return;
        }

        const toastId = notifyUtils.showLoading(FELLOWSHIP_NOTIFICATIONS.DELETE.DELETING);
        try {
            await FellowshipManager.instance.deleteFellowship(fellowship.id);
            notifyUtils.dismiss(toastId);
            notifyUtils.success(FELLOWSHIP_NOTIFICATIONS.DELETE.SUCCESS);
            // Refresh the list after successful deletion
            await fellowshipService.refresh();
        } catch (error) {
            notifyUtils.dismiss(toastId);
            // Error handled by FellowshipManager which uses handleApiError
        }
    }
};