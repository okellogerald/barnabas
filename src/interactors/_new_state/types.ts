export enum UI_STATE_TYPE {
    idle = "idle",
    loading = "loading",
    error = "error",
    success = "success",
    unauthorized = "unauthorized",
    notFound = "notFound",
    unauthenticated = "unauthenticated",
}

// Base abstract class with type discriminator
export abstract class AsyncUIState<T extends UI_STATE_TYPE> {
    readonly type: T;

    constructor(type: T) {
        this.type = type;
    }
}

// Idle state
export class AsyncIdleState extends AsyncUIState<UI_STATE_TYPE.idle> {
    constructor(public message?: string) {
        super(UI_STATE_TYPE.idle);
    }
}

// Loading state
export class AsyncLoadingState extends AsyncUIState<UI_STATE_TYPE.loading> {
    constructor(public message?: string) {
        super(UI_STATE_TYPE.loading);
    }
}

// Error state
export class AsyncErrorState extends AsyncUIState<UI_STATE_TYPE.error> {
    constructor(
        public error: Error | string,
        public actions: {
            retry: () => void;
        },
    ) {
        super(UI_STATE_TYPE.error);
    }

    get message(): string {
        return this.error instanceof Error ? this.error.message : this.error;
    }
}

// Unauthorized state with required permissions
export class AsyncUnauthorizedState
    extends AsyncUIState<UI_STATE_TYPE.unauthorized> {
    constructor(
        public message: string,
        public requiredPermissions: string[] = [],
        public actions?: {
            login?: () => void;
            goBack?: () => void;
            retry?: () => void;
        },
    ) {
        super(UI_STATE_TYPE.unauthorized);
    }
}

// Success state with generic data type
export class AsyncSuccessState<T> extends AsyncUIState<UI_STATE_TYPE.success> {
    constructor(
        public data: T,
        public actions: Record<string, (...args: any[]) => any>,
    ) {
        super(UI_STATE_TYPE.success);
    }
}

export class AsyncNotFoundState extends AsyncUIState<UI_STATE_TYPE.notFound> {
    constructor(
        public message: string,
        public resourceType: string,
        public resourceId?: string,
        public actions?: {
            goBack?: () => void;
            goToList?: () => void;
            create?: () => void;
            retry?: () => void;
        },
    ) {
        super(UI_STATE_TYPE.notFound);
    }
}

// Unauthenticated state for expired/invalid tokens
export class AsyncUnauthenticatedState
    extends AsyncUIState<UI_STATE_TYPE.unauthenticated> {
    constructor(
        public message: string,
        public actions?: {
            login?: () => void;
            retry?: () => void;
        },
    ) {
        super(UI_STATE_TYPE.unauthenticated);
    }
}

// Union type for all possible states
export type AsyncState<T = any> =
    | AsyncIdleState
    | AsyncLoadingState
    | AsyncErrorState
    | AsyncUnauthorizedState
    | AsyncNotFoundState
    | AsyncUnauthenticatedState
    | AsyncSuccessState<T>;

// Factory class for creating states
export class AsyncStateFactory {
    static idle(message?: string): AsyncIdleState {
        return new AsyncIdleState(message);
    }

    static loading(message?: string): AsyncLoadingState {
        return new AsyncLoadingState(message);
    }

    static error(
        params: { error: Error | string; retry: () => void },
    ): AsyncErrorState {
        return new AsyncErrorState(params.error, { retry: params.retry });
    }

    static unauthorized(params: {
        message: string;
        requiredPermissions?: string[];
        actions?: AsyncUnauthorizedState["actions"];
    }): AsyncUnauthorizedState {
        return new AsyncUnauthorizedState(
            params.message,
            params.requiredPermissions || [],
            params.actions,
        );
    }

    static success<T>(
        data: T,
        actions: Record<string, (...args: any[]) => any>,
    ): AsyncSuccessState<T> {
        return new AsyncSuccessState<T>(data, actions);
    }

    static notFound(params: {
        message?: string;
        resourceType: string;
        resourceId?: string;
        actions?: AsyncNotFoundState["actions"];
    }): AsyncNotFoundState {
        return new AsyncNotFoundState(
            params.message || `${params.resourceType} not found`,
            params.resourceType,
            params.resourceId,
            params.actions,
        );
    }

    static unauthenticated(params: {
        message: string;
        actions?: AsyncUnauthenticatedState["actions"];
    }): AsyncUnauthenticatedState {
        return new AsyncUnauthenticatedState(
            params.message,
            params.actions,
        );
    }
}

// Type guards for state checking
export function isIdleState(state: AsyncState<any>): state is AsyncIdleState {
    return state.type === UI_STATE_TYPE.idle;
}

export function isLoadingState(
    state: AsyncState<any>,
): state is AsyncLoadingState {
    return state.type === UI_STATE_TYPE.loading;
}

export function isErrorState(state: AsyncState<any>): state is AsyncErrorState {
    return state.type === UI_STATE_TYPE.error;
}

export function isUnauthorizedState(
    state: AsyncState<any>,
): state is AsyncUnauthorizedState {
    return state.type === UI_STATE_TYPE.unauthorized;
}

export function isSuccessState<T>(
    state: AsyncState<T>,
): state is AsyncSuccessState<T> {
    return state.type === UI_STATE_TYPE.success;
}

export function isNotFoundState(
    state: AsyncState<any>,
): state is AsyncNotFoundState {
    return state.type === UI_STATE_TYPE.notFound;
}

export function isUnauthenticatedState(
    state: AsyncState<any>,
): state is AsyncUnauthenticatedState {
    return state.type === UI_STATE_TYPE.unauthenticated;
}
