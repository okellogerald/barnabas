import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "./query.keys";
import { QueryUtils } from "./query.utils";

// Configure the query client with default options
const defaultOptions = {
    queries: {
        retry: 1,

        // Disable automatic refetching
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,

        // Optional: Set a stale time to control how long data remains fresh
        staleTime: Infinity, // Data never becomes stale automatically
    },
};

// Create the query client instance
export const queryClient = new QueryClient({ defaultOptions });

// Create query utilities with the client
export const Query = QueryUtils(queryClient);

// Export query keys
export { QueryKeys };

export * from "./query.builder";
export * from "./query.types";
