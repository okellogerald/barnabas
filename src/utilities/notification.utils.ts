import { PermissionError } from "@/lib/error";
import { ApiError } from "@/lib/error/error.api";
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
    options?: ToastOptions
  ): ToastId {
    return toast.success(description ? `${message}: ${description}` : message, {
      ...options,
      autoClose: duration || DEFAULT_DURATION,
    });
  },

  /**
   * Shows an error notification
   *
   * @param error
   * @param description Optional description
   * @param duration Optional duration in milliseconds (defaults to 4500)
   * @param options Optional toast options
   * @returns ToastId
   */
  error(
    error: any,
    description?: string,
    duration?: number,
    options?: ToastOptions
  ): ToastId {
    console.log("notify error: ", error)
    if (typeof error === "string") {
      return toast.error(description ? `${error}: ${description}` : error, {
        ...options,
        autoClose: duration || DEFAULT_DURATION,
      });
    }

    if (ApiError.is(error)) return notifyUtils.apiError(error);
    if (PermissionError.is(error)) return notifyUtils.permissionError(error);

    if (error instanceof Error) {
      return toast.error(
        description ? `${error.message}: ${description}` : error.message,
        {
          ...options,
          autoClose: duration || DEFAULT_DURATION,
        }
      );
    }

    return toast.error("An unknown error happened", {
      ...options,
      autoClose: duration || DEFAULT_DURATION,
    });
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
    options?: ToastOptions
  ): ToastId {
    return toast.warn(description ? `${message}: ${description}` : message, {
      ...options,
      autoClose: duration || DEFAULT_DURATION,
    });
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
    options?: ToastOptions
  ): ToastId {
    return toast.info(description ? `${message}: ${description}` : message, {
      ...options,
      autoClose: duration || DEFAULT_DURATION,
    });
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
   * Shows a notification for an API error.
   *
   * @param error - The error object received from the backend or a thrown exception.
   * @param options - Optional toast display settings.
   * @returns The toast ID.
   */
  apiError(error: ApiError, options?: ToastOptions): ToastId {
    return toast.error(error.getUserFriendlyMessage(), {
      ...options,
      autoClose: DEFAULT_DURATION,
    });
  },

  permissionError(error: PermissionError, options?: ToastOptions): ToastId {
    return toast.error(error.message, {
      ...options,
      autoClose: DEFAULT_DURATION,
    });
  },
};
