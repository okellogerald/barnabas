import z from "zod";
import { ErrorCategory, ErrorContext } from "./error.types";

/**
 * API error class for Church Management API
 * Maintains backward compatibility while handling the standard API error format:
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "error": "Validation Error",
 *   "details": { "field": "error message" }
 * }
 */
export class ApiError extends Error {
  /** The category of the API error */
  readonly category: ErrorCategory;

  /** The HTTP status code (maps to statusCode from API) */
  readonly status: number;

  /** Additional context information about the error */
  readonly context: ErrorContext;

  /** The original error object that caused this ApiError */
  readonly originalError: any;

  /** Field-specific validation errors (maps to details from API) */
  readonly details?: Record<string, string>;

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, string>,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    originalError?: any,
    context: ErrorContext = {}
  ) {
    super(message);

    Object.setPrototypeOf(this, ApiError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.category = category;
    this.context = context;
    this.originalError = originalError;
    this.status = statusCode;
    this.details = details;
  }

  /**
   * Creates an ApiError from various error sources with automatic category detection
   */
  static from(
    error: any,
    fallbackCategory: ErrorCategory = ErrorCategory.UNKNOWN,
    context: ErrorContext = {}
  ): ApiError {
    if (error instanceof ApiError || ApiError.is(error)) {
      return error;
    }

    let message = "An unexpected error occurred";
    let category = fallbackCategory;
    let details: Record<string, string> | undefined = undefined;
    let statusCode = 500;

    // Handle our standard API error format
    if (
      error &&
      typeof error === "object" &&
      typeof error.statusCode === "number" &&
      typeof error.message === "string"
    ) {
      message = error.message;
      statusCode = error.statusCode;
      // Auto-detect category based on status code
      category = ApiError.categorizeByStatus(error.statusCode);
    }

    if (
      error.details &&
      typeof error.details === "object" &&
      !Array.isArray(error.details) &&
      Object.values(error.details).every((v) => typeof v === "string")
    ) {
      details = error.details as Record<string, string>;
    }

    return new ApiError(statusCode, message, details, category, error, context);
  }

  /**
   * Categorizes error based on HTTP status code
   */
  private static categorizeByStatus(statusCode: number): ErrorCategory {
    switch (statusCode) {
      case 400:
        return ErrorCategory.VALIDATION;
      case 401:
        return ErrorCategory.AUTH;
      case 403:
        return ErrorCategory.PERMISSION;
      case 404:
        return ErrorCategory.NOT_FOUND;
      case 0:
        return ErrorCategory.NETWORK;
      default:
        return ErrorCategory.UNKNOWN;
    }
  }

  /**
   * Gets a user-friendly error message considering context and category
   */
  getUserFriendlyMessage(): string {
    // For validation errors with details, show field-specific messages
    if (this.category === ErrorCategory.VALIDATION && this.details) {
      const fieldErrors = Object.entries(this.details)
        .map(([_, message]) => `${message}`)
        .join("; ");
      return `${this.message}: ${fieldErrors}`;
    }

    // Use context to make error more specific
    if (this.context.entity && this.context.operation) {
      return `Failed to ${this.context.operation} ${this.context.entity}: ${this.message}`;
    } else if (this.context.entity) {
      const action = this.getCategoryAction();
      return `Failed to ${action} ${this.context.entity}: ${this.message}`;
    }

    return this.message;
  }

  /**
   * Gets the action verb based on error category
   */
  private getCategoryAction(): string {
    switch (this.category) {
      case ErrorCategory.FETCH:
        return "load";
      case ErrorCategory.CREATE:
        return "create";
      case ErrorCategory.UPDATE:
        return "update";
      case ErrorCategory.DELETE:
        return "delete";
      default:
        return "process";
    }
  }

  /**
   * Gets validation details for form field highlighting
   */
  getValidationErrors(): Record<string, string> {
    return this.details || {};
  }

  /**
   * Type guard to check if error is ApiError
   */
  static is(error: unknown): error is ApiError {
    return (
      z
        .object({
          statusCode: z.number(),
          message: z.string(),
          error: z.string(),
          details: z.record(z.string()).nullish(),
        })
        .safeParse(error).success === true
    );
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return (
      this.category === ErrorCategory.VALIDATION ||
      (this.status === 400 && !!this.details)
    );
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.category === ErrorCategory.AUTH || this.status === 401;
  }

  /**
   * Check if this is an authorization error
   */
  isAuthorizationError(): boolean {
    return this.category === ErrorCategory.PERMISSION || this.status === 403;
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.category === ErrorCategory.NOT_FOUND || this.status === 404;
  }

  /**
   * Check if this is a network error
   */
  isNetworkError(): boolean {
    return this.category === ErrorCategory.NETWORK || this.status === 0;
  }

  /**
   * Check if this is a fetch/read operation error
   */
  isFetchError(): boolean {
    return this.category === ErrorCategory.FETCH;
  }

  /**
   * Check if this is a create operation error
   */
  isCreateError(): boolean {
    return this.category === ErrorCategory.CREATE;
  }

  /**
   * Check if this is an update operation error
   */
  isUpdateError(): boolean {
    return this.category === ErrorCategory.UPDATE;
  }

  /**
   * Check if this is a delete operation error
   */
  isDeleteError(): boolean {
    return this.category === ErrorCategory.DELETE;
  }

  /**
   * Returns a string representation of the ApiError
   */
  toString(): string {
    const parts = [`ApiError: ${this.message}`];

    if (this.status !== 500) {
      parts.push(`(Status: ${this.status})`);
    }

    if (this.category !== ErrorCategory.UNKNOWN) {
      parts.push(`[${this.category.toUpperCase()}]`);
    }

    if (this.context.entity) {
      parts.push(`Entity: ${this.context.entity}`);
    }

    if (this.details && Object.keys(this.details).length > 0) {
      const detailsStr = Object.entries(this.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(", ");
      parts.push(`Details: {${detailsStr}}`);
    }

    return parts.join(" ");
  }
}
