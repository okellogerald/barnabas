import { notification } from "antd";
import { ArgsProps } from "antd/es/notification/interface";

// Notification duration in seconds
const DEFAULT_DURATION = 4.5;

/**
 * Notification utility functions
 */
export const notifyUtils = {
    /**
     * Shows a success notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in seconds (defaults to 4.5)
     */
    success(
        message: string,
        description?: string,
        duration?: number,
    ): void {
        notification.success({
            message,
            description,
            duration: duration || DEFAULT_DURATION,
        });
    },

    /**
     * Shows an error notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in seconds (defaults to 4.5)
     */
    error(
        message: string,
        description?: string,
        duration?: number,
    ): void {
        notification.error({
            message,
            description,
            duration: duration || DEFAULT_DURATION,
        });
    },

    /**
     * Shows a warning notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in seconds (defaults to 4.5)
     */
    warning(
        message: string,
        description?: string,
        duration?: number,
    ): void {
        notification.warning({
            message,
            description,
            duration: duration || DEFAULT_DURATION,
        });
    },

    /**
     * Shows an info notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in seconds (defaults to 4.5)
     */
    info(
        message: string,
        description?: string,
        duration?: number,
    ): void {
        notification.info({
            message,
            description,
            duration: duration || DEFAULT_DURATION,
        });
    },

    /**
     * Shows a custom notification
     *
     * @param config Notification configuration
     */
    custom(config: ArgsProps): void {
        notification.open(config);
    },

    /**
     * Shows an API error notification
     *
     * @param error The error object
     */
    apiError(error: any): void {
        const message = "Operation Failed";
        let description = "An unexpected error occurred";

        // Try to extract error message
        if (error && typeof error === "object") {
            if (error.message) {
                description = error.message;
            } else if (error.error) {
                description = error.error;
            } else if (error.data?.message) {
                description = error.data.message;
            }
        } else if (typeof error === "string") {
            description = error;
        }

        notification.error({
            message,
            description,
            duration: DEFAULT_DURATION,
        });
    },
};

/**
 * Hook for using notifications in components
 */
export function useNotification() {
    return notifyUtils;
}
