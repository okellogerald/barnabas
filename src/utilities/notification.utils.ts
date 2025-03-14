import { Id as ToastId, toast, ToastOptions } from "react-toastify";

// Notification duration in milliseconds
const DEFAULT_DURATION = 4500; // 4.5 seconds

/**
 * Notification utility functions using react-toastify
 */
export const notifyUtils = {
    /**
     * Shows a success notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in milliseconds (defaults to 4500)
     * @param options Optional toast options
     * @returns ToastId
     */
    success(
        message: string,
        description?: string,
        duration?: number,
        options?: ToastOptions,
    ): ToastId {
        return toast.success(
            description ? `${message}: ${description}` : message,
            {
                ...options,
                autoClose: duration || DEFAULT_DURATION,
            },
        );
    },

    /**
     * Shows an error notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in milliseconds (defaults to 4500)
     * @param options Optional toast options
     * @returns ToastId
     */
    error(
        message: string,
        description?: string,
        duration?: number,
        options?: ToastOptions,
    ): ToastId {
        return toast.error(
            description ? `${message}: ${description}` : message,
            {
                ...options,
                autoClose: duration || DEFAULT_DURATION,
            },
        );
    },

    /**
     * Shows a warning notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in milliseconds (defaults to 4500)
     * @param options Optional toast options
     * @returns ToastId
     */
    warning(
        message: string,
        description?: string,
        duration?: number,
        options?: ToastOptions,
    ): ToastId {
        return toast.warn(
            description ? `${message}: ${description}` : message,
            {
                ...options,
                autoClose: duration || DEFAULT_DURATION,
            },
        );
    },

    /**
     * Shows an info notification
     *
     * @param message The notification message
     * @param description Optional description
     * @param duration Optional duration in milliseconds (defaults to 4500)
     * @param options Optional toast options
     * @returns ToastId
     */
    info(
        message: string,
        description?: string,
        duration?: number,
        options?: ToastOptions,
    ): ToastId {
        return toast.info(
            description ? `${message}: ${description}` : message,
            {
                ...options,
                autoClose: duration || DEFAULT_DURATION,
            },
        );
    },

    /**
     * Shows a loading state for fetching more data.
     *
     * @param message The message to display during loading.
     * @param options Optional toast options.
     * @returns ToastId
     */
    showLoading(message: string, options?: ToastOptions): ToastId {
        return toast.loading(message, {
            ...options,
            autoClose: false, // Prevent auto-close
            closeOnClick: false, // Prevent close on click
            draggable: false, // Prevent dragging
            hideProgressBar: true, // Hide the progress bar
        });
    },

    /**
     * Shows a custom notification
     *
     * @param message The notification message
     * @param options Toast options
     * @returns ToastId
     */
    custom(message: string, options: ToastOptions): ToastId {
        return toast(message, options);
    },

    /**
     * Dismisses a specific toast notification.
     *
     * @param toastId The ID of the toast to dismiss.
     */
    dismiss(toastId: ToastId): void {
        toast.dismiss(toastId);
    },

    /**
     * Shows an API error notification
     *
     * @param error The error object
     * @param options Optional toast options
     * @returns ToastId
     */
    apiError(error: any, options?: ToastOptions): ToastId {
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

        return toast.error(`${message}: ${description}`, {
            ...options,
            autoClose: DEFAULT_DURATION,
        });
    },
};
