// Enhanced UI state types with specific action interfaces
export enum UI_STATE_TYPE {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
  UNAUTHORIZED = "unauthorized",
  NOT_FOUND = "notFound",
  UNAUTHENTICATED = "unauthenticated",
}

// ====================== Action Interfaces ====================== //

export interface IdleStateActions {
  initialize?: () => void;
}

export interface LoadingStateActions {
  // No actions required for loading state
}

export interface ErrorStateActions {
  retry: () => void;
}

export interface UnauthorizedStateActions {
  goBack: () => void;
  retry?: () => void;
  requestAccess?: () => void;
}

export interface NotFoundStateActions {
  goBack?: () => void;
  goToList?: () => void;
  retry: () => void;
}

export interface UnauthenticatedStateActions {
  login: () => void;
  retry?: () => void;
}

export interface SuccessStateActions {
  refresh?: () => void;
}

// ====================== Base State Class ====================== //

/**
 * Base state class that all other states will extend
 */
export abstract class BaseState<T extends UI_STATE_TYPE = UI_STATE_TYPE> {
  readonly type: T;

  constructor(type: T) {
    this.type = type;
  }

  // Method to check if state is of a specific type
  is<S extends BaseState>(type: UI_STATE_TYPE): this is S {
    return this.type === type;
  }
}

// ====================== State Classes ====================== //

/**
 * Idle state - application is waiting for user input or initialization
 */
export class IdleState extends BaseState<UI_STATE_TYPE.IDLE> {
  constructor(
    public message?: string,
    public actions: IdleStateActions = {}
  ) {
    super(UI_STATE_TYPE.IDLE);
  }

  // Initialize the application
  initialize(): void {
    if (this.actions.initialize) {
      this.actions.initialize();
    }
  }
}

/**
 * Loading state - operation is in progress
 */
export class LoadingState extends BaseState<UI_STATE_TYPE.LOADING> {
  constructor(
    public message?: string,
    public actions: LoadingStateActions = {}
  ) {
    super(UI_STATE_TYPE.LOADING);
  }
}

/**
 * Error state - operation failed with error
 */
export class ErrorState extends BaseState<UI_STATE_TYPE.ERROR> {
  public readonly message: string;

  constructor(
    public error: Error,
    public actions: ErrorStateActions
  ) {
    super(UI_STATE_TYPE.ERROR);
    this.message = this.error instanceof Error ? this.error.message : this.error;
  }

  // Get the full error stack if available
  getErrorStack(): string | undefined {
    return this.error instanceof Error ? this.error.stack : undefined;
  }

  // Get error message
  getErrorMessage(): string {
    return this.message;
  }

  // Retry the operation
  retry(): void {
    this.actions.retry();
  }
}

/**
 * Unauthorized state - user doesn't have permission to perform an action
 */
export class UnauthorizedState extends BaseState<UI_STATE_TYPE.UNAUTHORIZED> {
  constructor(
    public message: string,
    public requiredPermissions: string[] = [],
    public actions: UnauthorizedStateActions
  ) {
    super(UI_STATE_TYPE.UNAUTHORIZED);
  }

  // Go back to previous page
  goBack(): void {
    this.actions.goBack();
  }

  // Retry the operation
  retry(): void {
    if (this.actions.retry) {
      this.actions.retry();
    }
  }

  // Request access to the resource
  requestAccess(): void {
    if (this.actions.requestAccess) {
      this.actions.requestAccess();
    }
  }
}

/**
 * Not found state - requested resource was not found
 */
export class NotFoundState extends BaseState<UI_STATE_TYPE.NOT_FOUND> {
  constructor(
    public message: string,
    public resourceType: string,
    public actions: NotFoundStateActions,
    public resourceId?: string,
  ) {
    super(UI_STATE_TYPE.NOT_FOUND);
  }

  // Go back to previous page
  goBack(): void {
    if (this.actions.goBack) {
      this.actions.goBack();
    }
  }

  // Go to list view
  goToList(): void {
    if (this.actions.goToList) {
      this.actions.goToList();
    }
  }

  // Retry the operation
  retry(): void {
    this.actions.retry();
  }
}

/**
 * Unauthenticated state - user is not logged in
 */
export class UnauthenticatedState extends BaseState<UI_STATE_TYPE.UNAUTHENTICATED> {
  constructor(
    public message: string,
    public actions: UnauthenticatedStateActions
  ) {
    super(UI_STATE_TYPE.UNAUTHENTICATED);
  }

  // Login to get access
  login(): void {
    this.actions.login();
  }

  // Retry the operation
  retry(): void {
    if (this.actions.retry) {
      this.actions.retry();
    }
  }
}

/**
 * Success state - operation completed successfully with data
 */
export class SuccessState<T> extends BaseState<UI_STATE_TYPE.SUCCESS> {
  constructor(
    public data: T,
    public actions: SuccessStateActions = {}
  ) {
    super(UI_STATE_TYPE.SUCCESS);
  }

  // Refresh the data
  refresh(): void {
    if (this.actions.refresh) {
      this.actions.refresh();
    }
  }
}

// ====================== Type Union ====================== //

// Union type for all possible states
export type AsyncState<T = any> =
  | IdleState
  | LoadingState
  | ErrorState
  | UnauthorizedState
  | NotFoundState
  | UnauthenticatedState
  | SuccessState<T>;

// ====================== Factory Class ====================== //

/**
 * Factory for creating state instances with appropriate actions
 */
export class StateFactory {
  static idle(args: { message?: string; actions?: IdleStateActions } = {}): IdleState {
    return new IdleState(args.message, args.actions);
  }

  static loading(args: { message?: string; actions?: LoadingStateActions } = {}): LoadingState {
    return new LoadingState(args.message, args.actions);
  }

  static error(args: { error: Error; actions: ErrorStateActions }): ErrorState {
    return new ErrorState(args.error, args.actions);
  }

  static unauthorized(
    args: {
      message: string;
      requiredPermissions?: string[];
      actions: UnauthorizedStateActions;
    }
  ): UnauthorizedState {
    return new UnauthorizedState(args.message, args.requiredPermissions, args.actions);
  }

  static notFound(
    args: {
      message: string;
      resourceType: string;
      resourceId?: string;
      actions: NotFoundStateActions;
    }
  ): NotFoundState {
    return new NotFoundState(args.message, args.resourceType, args.actions, args.resourceId);
  }

  static unauthenticated(args: { message: string; actions: UnauthenticatedStateActions }): UnauthenticatedState {
    return new UnauthenticatedState(args.message, args.actions);
  }

  static success<T>(args: { data: T; actions?: SuccessStateActions }): SuccessState<T> {
    return new SuccessState<T>(args.data, args.actions);
  }
}

// ====================== Type Guards ====================== //

// Type guards for state checking
export function isIdleState(state: AsyncState): state is IdleState {
  return state.type === UI_STATE_TYPE.IDLE;
}

export function isLoadingState(state: AsyncState): state is LoadingState {
  return state.type === UI_STATE_TYPE.LOADING;
}

export function isErrorState(state: AsyncState): state is ErrorState {
  return state.type === UI_STATE_TYPE.ERROR;
}

export function isUnauthorizedState(state: AsyncState): state is UnauthorizedState {
  return state.type === UI_STATE_TYPE.UNAUTHORIZED;
}

export function isNotFoundState(state: AsyncState): state is NotFoundState {
  return state.type === UI_STATE_TYPE.NOT_FOUND;
}

export function isUnauthenticatedState(state: AsyncState): state is UnauthenticatedState {
  return state.type === UI_STATE_TYPE.UNAUTHENTICATED;
}

export function isSuccessState<T>(state: AsyncState<T>): state is SuccessState<T> {
  return state.type === UI_STATE_TYPE.SUCCESS;
}