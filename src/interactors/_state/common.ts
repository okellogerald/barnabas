/**
 * Comprehensive UI State Management Utility
 *
 * This module provides a robust, type-safe system for managing UI states
 * during data fetching and handling various scenarios like loading,
 * success and error
 *
 * Key Features:
 * - Strongly-typed state management
 * - Flexible error handling
 * - Generic state determination function
 */

import { ActionPermission } from "@/managers/auth/permission";

/**
 * Enumeration of possible UI state types
 * Defines the core states a UI component can experience during data operations
 */
export enum UI_STATE_TYPE {
    idle = "idle",
    /** Successful data retrieval state */
    success = "success",
    /** Data is currently being loaded */
    loading = "loading",
    /** An error occurred during data fetching */
    error = "error",
    /** User lacks necessary permissions */
    unauthorized = "unauthorized",
}

/** Base interface for all UI states with type safety */
export type UIStateBase<T extends UI_STATE_TYPE> = {
    /** The current state type */
    type: T;
};

/**
 * UIStateFactory: A factory class for creating strongly-typed UI states
 * Provides convenient methods to generate different state variations
 */
export class UIStateFactory {
    /**
     * Creates a loading state with optional message
     * @param params.message Optional descriptive message for the loading state
     * @returns A strongly-typed loading state object
     */
    static loading(params?: { message?: string }): ILoadingState {
        return { type: UI_STATE_TYPE.loading, message: params?.message };
    }

    /**
     * Creates an error state with retry mechanism
     * @param params.retry Function to retry the failed operation
     * @param params.message Optional error description
     * @returns A strongly-typed error state object
     */
    static error(params: { retry: () => void; message?: string }): IErrorState {
        return {
            type: UI_STATE_TYPE.error,
            message: params.message,
            actions: { retry: params.retry },
        };
    }
}

// Specific state type definitions for enhanced type safety
export type ILoadingState = UIStateBase<UI_STATE_TYPE.loading> & {
    message?: string;
};

export type IIdleState = UIStateBase<UI_STATE_TYPE.idle> & {
    message?: string;
};

export type IErrorState = UIStateBase<UI_STATE_TYPE.error> & {
    message?: string;
    actions: {
        retry: () => void;
    };
};

export type IPermissionErrorState = UIStateBase<UI_STATE_TYPE.unauthorized> & {
    message?: string;
    permissions: ActionPermission[];
    actions: {
        retry: () => void;
    };
};
