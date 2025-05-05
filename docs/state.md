# Reactive Class-Based State Management in React

This document outlines our app's state management approach, which uses typed class hierarchies to represent UI states along with explicit state transitions. This pattern gives us strong type safety, encapsulated business logic, and deterministic UI rendering based on state.

## Core Concepts

Our state management is built around a few key principles:

1. **Discriminated Union Types**: States are represented as a union of different class types
2. **Class Encapsulation**: Each state type encapsulates data and behavior
3. **Explicit State Transitions**: Transitions between states are handled through specific actions
4. **Type Guards**: Specialized functions identify state types at runtime

## State Hierarchy

### Base State Types

The foundation of our system is a set of state classes representing different UI states:

```typescript
export enum UI_STATE_TYPE {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
  UNAUTHORIZED = "unauthorized",
  NOT_FOUND = "notFound",
  UNAUTHENTICATED = "unauthenticated",
}

export abstract class BaseState<T extends UI_STATE_TYPE = UI_STATE_TYPE> {
  readonly type: T;

  constructor(type: T) {
    this.type = type;
  }
}
```

### Generic State Classes

We provide a set of standard state classes for common application states:

```typescript
export class IdleState extends BaseState<UI_STATE_TYPE.IDLE> {
  constructor(
    public message?: string,
    public actions: IdleStateActions = {}
  ) {
    super(UI_STATE_TYPE.IDLE);
  }

  initialize(): void {
    if (this.actions.initialize) {
      this.actions.initialize();
    }
  }
}

export class LoadingState extends BaseState<UI_STATE_TYPE.LOADING> {
  constructor(
    public message?: string,
    public actions: LoadingStateActions = {}
  ) {
    super(UI_STATE_TYPE.LOADING);
  }
}

export class ErrorState extends BaseState<UI_STATE_TYPE.ERROR> {
  public readonly message: string;

  constructor(
    public error: Error | string,
    public actions: ErrorStateActions
  ) {
    super(UI_STATE_TYPE.ERROR);
    this.message = this.error instanceof Error ? this.error.message : this.error;
  }

  retry(): void {
    this.actions.retry();
  }
}

export class SuccessState<T> extends BaseState<UI_STATE_TYPE.SUCCESS> {
  constructor(
    public data: T,
    public actions: SuccessStateActions = {}
  ) {
    super(UI_STATE_TYPE.SUCCESS);
  }

  refresh(): void {
    if (this.actions.refresh) {
      this.actions.refresh();
    }
  }
}
```

### Extended Success States

For domain-specific logic, we extend the base `SuccessState` class:

```typescript
export class PayoutDetailsPageSuccessState extends SuccessState<Payout> {
  readonly canApprove: boolean;
  readonly canReject: boolean;
  
  constructor(args: {
    data: Payout;
    canApprove: boolean;
    canReject: boolean;
    actions: {
      refresh: () => void;
    };
  }) {
    super(args.data, { refresh: args.actions.refresh });
    this.canApprove = args.canApprove;
    this.canReject = args.canReject;
  }
  
  // Custom type guard for this specific extended state
  static is(state: AsyncState<any>): state is PayoutDetailsPageSuccessState {
    return (
      isSuccessState(state) && 
      'canApprove' in state && 
      'canReject' in state &&
      'showApproveDialog' in state &&
      'showRejectDialog' in state
    );
  }
  
  showApproveDialog() {
    if (this.canApprove) {
      // Approval logic...
    }
  }
  
  showRejectDialog() {
    if (this.canReject) {
      // Rejection logic...
    }
  }
}
```

## Type Guards

Type guards allow us to safely check state types in components:

```typescript
export function isIdleState(state: AsyncState): state is IdleState {
  return state.type === UI_STATE_TYPE.IDLE;
}

export function isLoadingState(state: AsyncState): state is LoadingState {
  return state.type === UI_STATE_TYPE.LOADING;
}

export function isErrorState(state: AsyncState): state is ErrorState {
  return state.type === UI_STATE_TYPE.ERROR;
}

export function isSuccessState<T>(state: AsyncState<T>): state is SuccessState<T> {
  return state.type === UI_STATE_TYPE.SUCCESS;
}
```

For extended states, we implement custom `is` methods on each class to check for their specific properties.

## React Query Integration

Our state system integrates with React Query via a utility function:

```typescript
export function mapQueryToAsyncState<T>(
  queryResult: UseQueryResult<T, unknown>,
  options?: {
    loadingMessage?: string;
    resourceType?: string;
    onSuccess?: (data: T) => SuccessState<T>;
  }
): AsyncState<T> {
  const { isLoading, error, data, isSuccess, refetch } = queryResult;
  
  if (isLoading) {
    return new LoadingState(options?.loadingMessage || "Loading...");
  }
  
  if (error) {
    return new ErrorState(error, { retry: refetch });
  }
  
  if (isSuccess && data) {
    // Allow creating custom success states
    if (options?.onSuccess) {
      return options.onSuccess(data);
    }
    return new SuccessState<T>(data, { refresh: refetch });
  }
  
  // Default state
  return new IdleState();
}
```

## Custom Hooks

We provide hooks for using our state management system:

```typescript
export const usePayoutDetails = () => {
  const { payoutId = "" } = useParams<{ payoutId: string }>();
  const query = PayoutQueries.useDetail(payoutId);
  
  return mapQueryToAsyncState(query, {
    loadingMessage: "Loading payout details...",
    onSuccess(data) {
      return new PayoutDetailsPageSuccessState({
        data,
        canApprove: data.status === PAYOUT_STATUS.PENDING,
        canReject: data.status === PAYOUT_STATUS.PENDING,
        actions: {
          refresh: () => {
            query.refetch();
          }
        }
      });
    },
  });
};
```

## Using States in Components

Components use type guards to render different UI based on state:

```tsx
function PayoutDetailsPage() {
  const state = usePayoutDetails();

  // Basic loading/error handling
  if (isLoadingState(state)) {
    return <Spinner message={state.message} />;
  }
  
  if (isErrorState(state)) {
    return (
      <ErrorMessage 
        message={state.getErrorMessage()} 
        onRetry={() => state.retry()} 
      />
    );
  }
  
  // Safe access to data in success state
  if (isSuccessState(state)) {
    return (
      <div>
        <PayoutDetails payout={state.data} />
        <Button onClick={() => state.refresh()}>Refresh</Button>
        
        {/* Check for extended state capabilities */}
        {PayoutDetailsPageSuccessState.is(state) && (
          <>
            {state.canApprove && (
              <Button onClick={() => state.showApproveDialog()}>
                Approve
              </Button>
            )}
            
            {state.canReject && (
              <Button onClick={() => state.showRejectDialog()}>
                Reject
              </Button>
            )}
          </>
        )}
      </div>
    );
  }
  
  return null;
}
```

## Benefits

This state management approach offers several advantages:

1. **Type Safety**: TypeScript can validate state transitions and UI rendering
2. **Domain Encapsulation**: Business logic lives in state classes, not components
3. **Self-Documenting**: State classes clearly document available data and actions
4. **UI Consistency**: Components render predictably based on well-defined states
5. **Testability**: State logic can be tested independently of components
6. **Extensibility**: New state types and behaviors can be added without modifying existing code

## Best Practices

### Defining States

- Create a dedicated state class for each distinct UI state
- Add only the data and actions relevant to that state
- Include validation in methods (e.g., `if (this.canEdit)`)

### Extending Success States

- Extend `SuccessState` for domain-specific functionality
- Implement a custom `is` method to safely check for extended properties
- Group related actions and properties in the extended state

### Component Design

- Use type guards to check state types before accessing properties
- Add fallbacks for unexpected states
- Keep components focused on rendering, not state transitions

### Custom Hooks

- Create domain-specific hooks that return appropriate state objects
- Consider returning the specific union of states your component handles
- Handle state transitions within hooks, not components

## Real-World Example

Here's a complete example showing how this pattern works in practice:

```tsx
// 1. Define extended state
export class UserProfileSuccessState extends SuccessState<User> {
  readonly canEdit: boolean;
  readonly isAdmin: boolean;
  
  constructor(user: User, actions: { refresh: () => void }) {
    super(user, { refresh: actions.refresh });
    this.canEdit = user.permissions.includes('EDIT_PROFILE');
    this.isAdmin = user.role === 'ADMIN';
  }
  
  static is(state: AsyncState<any>): state is UserProfileSuccessState {
    return (
      isSuccessState(state) && 
      'canEdit' in state && 
      'isAdmin' in state
    );
  }
  
  editProfile() {
    if (this.canEdit) {
      // Navigate to edit profile page
    }
  }
}

// 2. Create a custom hook
export function useUserProfile(userId: string) {
  const query = userAPI.useGetUser(userId);
  
  return mapQueryToAsyncState(query, {
    loadingMessage: "Loading user profile...",
    onSuccess: (data) => new UserProfileSuccessState(data, {
      refresh: () => query.refetch()
    })
  });
}

// 3. Use in component
function UserProfilePage() {
  const { userId } = useParams();
  const state = useUserProfile(userId);
  
  if (isLoadingState(state)) {
    return <LoadingSpinner message={state.message} />;
  }
  
  if (isErrorState(state)) {
    return <ErrorView message={state.message} onRetry={() => state.retry()} />;
  }
  
  if (isSuccessState(state)) {
    return (
      <ProfileContainer>
        <h1>{state.data.name}</h1>
        <ProfileDetails user={state.data} />
        
        {/* Handle extended state capabilities */}
        {UserProfileSuccessState.is(state) && state.canEdit && (
          <Button onClick={() => state.editProfile()}>
            Edit Profile
          </Button>
        )}
      </ProfileContainer>
    );
  }
  
  return <EmptyState />;
}
```

### Handling Multiple Queries: `mapQueriesToAsyncState`

For views requiring multiple React Query results, we use `mapQueriesToAsyncState`. It accepts an array of `useQuery` results and determines the composite UI state (loading, error, success) based on all of them.

```ts
export function mapQueriesToAsyncState<
  Q extends readonly UseQueryResult<any, unknown>[],
  F extends (results: {
    [K in keyof Q]: Q[K] extends UseQueryResult<infer D, any> ? NonNullable<D> : never;
  }) => AsyncState<any>,
>(
  queries: Q,
  options: {
    loadingMessage?: string;
    localData?: ReturnType<F> extends AsyncState<infer R> ? R : never;
    resourceType?: string;
    resourceId?: string;
    onSuccess: F;
    customErrorMapping?: (error: any) => ReturnType<F> | null;
  }
): ReturnType<F> {
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const isSuccess = queries.every((q) => q.isSuccess);
  const isRefetching = queries.some((q) => q.isRefetching);
  const error = queries.find((q) => q.error)?.error;
  const rawResults = queries.map((q) => q.data);

  const refetchAll = () => queries.forEach((q) => q.refetch());

  if (isRefetching && options?.localData) {
    return StateFactory.success({
      data: options.localData,
      actions: { refresh: refetchAll },
    }) as ReturnType<F>;
  }

  if (isLoading || (isRefetching && !options?.localData)) {
    return StateFactory.loading({
      message: options?.loadingMessage ?? "Loading...",
    }) as ReturnType<F>;
  }

  if (isError) {
    if (options?.customErrorMapping) {
      const custom = options.customErrorMapping(error);
      if (custom) return custom;
    }

    const apiError = error as ApiError;
    if (apiError?.statusCode === 401) {
      return StateFactory.unauthenticated({
        message: apiError.message || "Authentication required",
        actions: {
          login: () => (window.location.href = "/login"),
          retry: refetchAll,
        },
      }) as ReturnType<F>;
    }

    if (apiError?.statusCode === 403) {
      return StateFactory.unauthorized({
        message: apiError.message || "You don't have permission to access this resource",
        requiredPermissions: [],
        actions: {
          goBack: () => window.history.back(),
          retry: refetchAll,
        },
      }) as ReturnType<F>;
    }

    if (apiError?.statusCode === 404) {
      return StateFactory.notFound({
        message: apiError.message || "Resource not found",
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
        actions: {
          goBack: () => window.history.back(),
          retry: refetchAll,
        },
      }) as ReturnType<F>;
    }

    const safeError = error instanceof Error ? error : new Error(String(error));
    return StateFactory.error({
      error: safeError,
      actions: { retry: refetchAll },
    }) as ReturnType<F>;
  }

  if (isSuccess) {
    const safeResults = rawResults.map((r, i) => {
      if (r === undefined) throw new Error(`Query ${i} returned undefined`);
      return r;
    }) as Parameters<F>[0];
    return options.onSuccess(safeResults);
  }

  return StateFactory.idle() as ReturnType<F>;
}
```

### Example Usage

```ts
const state = mapQueriesToAsyncState([userQuery, settingsQuery] as const, {
  loadingMessage: "Loading profile...",
  onSuccess: ([user, settings]) => {
    return new UserProfilePageState({
      user,
      settings,
      actions: {
        refresh: () => {
          userQuery.refetch();
          settingsQuery.refetch();
        }
      }
    });
  }
});
```

* ✅ No need to specify types manually
* ✅ Queries are strictly typed in order using `as const`
* ✅ `data` in the final state is non-null and correctly inferred
