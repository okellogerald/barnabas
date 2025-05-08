# Data Fetching Architecture in React Application

This document outlines the comprehensive data fetching architecture used in our React application, detailing the flow from API schema definitions to UI components.

## Table of Contents

- [Data Fetching Architecture in React Application](#data-fetching-architecture-in-react-application)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Data Layer Components](#data-layer-components)
    - [Schemas](#schemas)
    - [Contracts](#contracts)
    - [Query Builders](#query-builders)
    - [Repositories](#repositories)
  - [Business Logic Layer](#business-logic-layer)
    - [Managers](#managers)
    - [Query Hooks](#query-hooks)
  - [UI Integration](#ui-integration)
    - [AsyncState Pattern](#asyncstate-pattern)
    - [Custom UI Hooks](#custom-ui-hooks)
    - [UI Components](#ui-components)
  - [State Management](#state-management)
  - [Data Flow Example](#data-flow-example)
  - [Benefits and Best Practices](#benefits-and-best-practices)
    - [Benefits](#benefits)
    - [Best Practices](#best-practices)

## Architecture Overview

Our data fetching architecture follows a layered approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                          │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                     Custom UI Hooks                         │
│                       (AsyncState)                          │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    Query Hooks (TanStack)                   │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                  Managers (Permission & Conversion)         │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                     Repositories (API)                      │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    Query Builders & Contracts               │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    Schemas (Data Validation)                │
└─────────────────────────────────────────────────────────────┘
```

Each layer has distinct responsibilities and communicates only with adjacent layers, ensuring a clean separation of concerns.

## Data Layer Components

### Schemas

Schemas define the structure of our data models using Zod, providing strong typing and validation.

**Location**: `data/<model>/schema.ts`

```typescript
// Example from data/envelope/schema.ts
export const envelopeSchema = z.object({
  id: CommonSchemas.id,
  envelopeNumber: z.number().int().positive("Envelope number must be positive"),
  churchId: CommonSchemas.id,
  memberId: CommonSchemas.id.nullable(),
  assignedAt: CommonSchemas.date.nullable(),
  releasedAt: CommonSchemas.date.nullable(),
  member: MemberSchemas.memberSchema.nullable(),
  ...CommonSchemas.systemDates,
});

// Export types
export type EnvelopeDTO = z.infer<typeof envelopeSchema>;
```

The schemas serve multiple purposes:
- Define expected data structure for API communication
- Provide type safety for DTOs (Data Transfer Objects)
- Enable validation of incoming and outgoing data
- Create a single source of truth for entity structure

### Contracts

Contracts define the API endpoints using `@ts-rest/core`, specifying HTTP methods, paths, request/response shapes, and expected status codes.

**Location**: `data/<model>/contract.ts`

```typescript
// Example from data/envelope/contract.ts
export const envelopeContract = c.router({
  // Get all envelopes with pagination
  getAll: {
    method: "GET",
    path: "/",
    responses: {
      200: z.object({
        results: z.array(envelopeSchema),
        total: z.number(),
      }),
      401: z.null(),
    },
    summary: "Get all envelopes with pagination",
    query: z.object({}),
  },
  
  // Other endpoints...
});
```

Contracts provide:
- A strongly-typed API client
- Documentation of available endpoints
- TypeScript inference for request/response types
- Runtime validation of API responses

### Query Builders

Query builders provide a fluent interface for constructing complex queries using Objection's query syntax.

**Location**: `data/<model>/query_builder.ts`

```typescript
// Example from data/envelope/query_builder.ts
export class EnvelopeQueryBuilder extends QueryBuilder {
  // Type tag to identify EnvelopeQueryBuilder instances
  [ENVELOPE_QUERY_BUILDER_TYPE] = true;
  
  // Filter methods
  filterByEnvelopeNumber(number: number): this {
    return this.where("envelopeNumber", number);
  }
  
  filterByAssignmentStatus(isAssigned: boolean): this {
    if (isAssigned) {
      return this.whereNotNull("assignedAt");
    }
    return this.whereNull("assignedAt");
  }
  
  // Configuration methods
  configureForCount(): this {
    this.count("*");
    return this;
  }
  
  // Factory methods
  static from(
    options?: EnvelopeQueryCriteria | EnvelopeQueryBuilder,
  ): EnvelopeQueryBuilder {
    // Implementation...
  }
}
```

Query builders provide:
- Type-safe query construction
- Encapsulation of complex query logic
- Reusable filter patterns
- Improved readability through fluent API

### Repositories

Repositories are responsible for making actual API calls using the contracts defined above.

**Location**: `data/<model>/repository.ts`

```typescript
// Example from data/envelope/repository.ts
export class EnvelopeRepository extends BaseRepository<typeof envelopeContract> {
  constructor() {
    super("envelope", envelopeContract);
  }
  
  // Get all envelopes with pagination
  async getAll(
    queryBuilder: EnvelopeQueryBuilder,
  ): Promise<{ results: EnvelopeDTO[]; total: number }> {
    const result = await this.client.getAll({
      query: queryBuilder.build(),
    });
    return this.handleResponse<{ results: EnvelopeDTO[]; total: number }>(
      result,
      200,
    );
  }
  
  // Other methods...
}
```

Repositories handle:
- API communication
- Serialization of query parameters
- Error handling
- Response normalization
- DTO return types

## Business Logic Layer

### Managers

Managers add a business logic layer between repositories and query hooks, enforcing permissions and converting DTOs to domain models.

**Location**: `features/<model>/manager.ts`

```typescript
// Example from features/envelope/manager.ts
export class EnvelopeManager {
  private static _instance: EnvelopeManager;
  private _repo: EnvelopeRepository;
  private _permManager: PermissionsManager;
  
  // Singleton pattern
  public static get instance(): EnvelopeManager {
    if (!EnvelopeManager._instance) {
      EnvelopeManager._instance = new EnvelopeManager(
        new EnvelopeRepository(),
        PermissionsManager.getInstance(),
      );
    }
    return EnvelopeManager._instance;
  }
  
  // Example method
  public async getEnvelopeById(
    envelopeId: string,
  ): Promise<Envelope | undefined> {
    // 1. Permission check
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_BY_ID)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_BY_ID);
    }
    
    // 2. Repository call
    try {
      const dto = await this._repo.getById(envelopeId);
      
      // 3. Convert DTO to model
      return dto ? Envelope.fromDTO(dto) : undefined;
    } catch (error) {
      console.error(`Error retrieving envelope by ID (${envelopeId}):`, error);
      throw new Error("Failed to retrieve envelope by ID.");
    }
  }
}
```

Managers provide:
- Permission enforcement
- DTO to model conversion
- Business logic operations
- Error handling and logging
- Singleton pattern for consistent access

### Query Hooks

Query hooks leverage TanStack Query (React Query) to provide data fetching, caching, and state management.

**Location**: `features/<model>/queries.tsx`

```typescript
// Example from features/envelope/queries.tsx
export const EnvelopeQueries = {
  // Hook to fetch a single envelope by ID
  useDetail: (id: string): UseQueryResult<Envelope, Error> =>
    useQuery({
      queryKey: QueryKeys.Envelopes.detail(id),
      queryFn: async () => {
        const envelope = await envelopeManager.getEnvelopeById(id);
        if (!envelope) {
          throw new Error(`Envelope with ID ${id} not found`);
        }
        return envelope;
      },
      enabled: !!id,
    }),
    
  // Mutation hook for releasing an envelope
  useRelease: (): UseMutationResult<Envelope, Error, string, unknown> =>
    useMutation({
      mutationFn: async (envelopeId: string) => {
        return await envelopeManager.releaseEnvelope(envelopeId);
      },
      onSuccess: (updatedEnvelope, envelopeId) => {
        // Update cache and invalidate related queries
        queryClient.setQueryData(
          QueryKeys.Envelopes.detail(envelopeId),
          updatedEnvelope
        );
        Query.Envelopes.invalidateList();
        Query.Envelopes.invalidateAvailable();
        Query.Envelopes.invalidateHistory(envelopeId);
      },
    }),
  
  // Other query hooks...
};
```

Query hooks provide:
- Centralized query and mutation definitions
- Consistent cache invalidation
- Optimistic updates
- Data prefetching capabilities
- Integration with managers for data fetching

## UI Integration

### AsyncState Pattern

The AsyncState pattern uses class-based state representation to encapsulate UI states (loading, error, success) and associated behaviors.

**Key components**:

1. **Base State Classes**:
```typescript
// Generic state classes for different UI states
export class LoadingState extends BaseState<UI_STATE_TYPE.LOADING> {
  constructor(public message?: string, public actions: LoadingStateActions = {}) {
    super(UI_STATE_TYPE.LOADING);
  }
}

export class SuccessState<T> extends BaseState<UI_STATE_TYPE.SUCCESS> {
  constructor(public data: T, public actions: SuccessStateActions = {}) {
    super(UI_STATE_TYPE.SUCCESS);
  }
  
  refresh(): void {
    if (this.actions.refresh) {
      this.actions.refresh();
    }
  }
}

// And other state classes...
```

2. **Extended Success States**:
```typescript
// Example from features/envelope/use_envelope_details.tsx
export class EnvelopeDetailSuccessState extends SuccessState<Envelope> {
  readonly envelope: Envelope;
  readonly history: EnvelopeHistory[];
  readonly isReleasing: boolean;
  readonly isAssigning: boolean;
  
  constructor(args: {
    data: Envelope;
    history: EnvelopeHistory[];
    isReleasing: boolean;
    isAssigning: boolean;
    actions: {
      refresh: () => void;
      release: () => Promise<void>;
      assign: () => void;
    };
  }) {
    super(args.data, { refresh: args.actions.refresh });
    this.envelope = args.data;
    this.history = args.history;
    this.isReleasing = args.isReleasing;
    this.isAssigning = args.isAssigning;
    this._release = args.actions.release;
    this._assign = args.actions.assign;
  }
  
  release(): Promise<void> {
    return this._release();
  }
  
  assign(): void {
    this._assign();
  }
  
  // Type guard for safely checking state type
  static is(state: any): state is EnvelopeDetailSuccessState {
    return state.type === UI_STATE_TYPE.SUCCESS && "envelope" in state;
  }
}
```

3. **Mapping Query Results to AsyncState**:
```typescript
// Utility function to map query results to AsyncState
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
    if (options?.onSuccess) {
      return options.onSuccess(data);
    }
    return new SuccessState<T>(data, { refresh: refetch });
  }
  
  return new IdleState();
}
```

The AsyncState pattern provides:
- Type-safe state transitions
- Encapsulated UI state behaviors
- Deterministic UI rendering
- Domain-specific actions and properties
- Better testability of state logic

### Custom UI Hooks

Custom UI hooks combine TanStack Query hooks with the AsyncState pattern to provide component-specific data and behaviors.

**Location**: `features/<model>/use_<specific_feature>.tsx`

```typescript
// Example from features/envelope/use_envelope_details.tsx
export const useEnvelopeDetail = (id: string) => {
  const navigate = useNavigate();
  const releaseMutation = EnvelopeQueries.useRelease();
  
  // Combined queries
  const [envelopeQuery, historyQuery] = useQueries({
    queries: [
      {
        ...EnvelopeQueries.useDetail(id),
        queryKey: QueryKeys.Envelopes.detail(id),
      },
      {
        ...EnvelopeQueries.useHistory(id),
        queryKey: QueryKeys.Envelopes.history(id),
      }
    ]
  });
  
  const handleRelease = useCallback(async () => {
    if (!id) return;
    try {
      await releaseMutation.mutateAsync(id);
      envelopeQuery.refetch();
      historyQuery.refetch();
    } catch (error) {
      console.error('Failed to release envelope:', error);
      throw error;
    }
  }, [id, releaseMutation, envelopeQuery, historyQuery]);
  
  const handleAssign = useCallback(() => {
    navigate(`/envelopes/${id}/assign`);
  }, [id, navigate]);
  
  // Map queries to AsyncState
  return mapQueriesToAsyncState(
    ([envelopeQuery, historyQuery] as const),
    {
      loadingMessage: "Loading envelope details...",
      onSuccess: ([envelope, history]) => {
        return new EnvelopeDetailSuccessState({
          data: envelope,
          history: history,
          isReleasing: releaseMutation.isPending,
          isAssigning: false,
          actions: {
            refresh: () => {
              envelopeQuery.refetch();
              historyQuery.refetch();
            },
            release: handleRelease,
            assign: handleAssign,
          }
        });
      }
    });
};
```

Custom UI hooks provide:
- Component-specific data fetching
- Encapsulated UI logic and callbacks
- Integration of multiple data sources
- AsyncState mapping for UI state handling
- Navigation and mutation integration

### UI Components

UI components consume the custom hooks and render based on the current AsyncState.

```tsx
// Example UI component
function EnvelopeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const state = useEnvelopeDetail(id!);
  
  // Render based on state
  if (isLoadingState(state)) {
    return <Spinner message={state.message} />;
  }
  
  if (isErrorState(state)) {
    return (
      <ErrorMessage 
        message={state.message} 
        onRetry={() => state.retry()} 
      />
    );
  }
  
  if (EnvelopeDetailSuccessState.is(state)) {
    const { envelope, history, isReleasing } = state;
    
    return (
      <Card title={`Envelope #${envelope.envelopeNumber}`}>
        <EnvelopeDetails envelope={envelope} />
        <EnvelopeHistory history={history} />
        
        <Button 
          loading={isReleasing}
          disabled={!envelope.memberId}
          onClick={() => state.release()}
        >
          Release Envelope
        </Button>
        
        <Button
          disabled={!!envelope.memberId}
          onClick={() => state.assign()}
        >
          Assign Envelope
        </Button>
      </Card>
    );
  }
  
  return null;
}
```

This approach enables:
- Clean component code
- Predictable UI rendering
- Type-safe access to state properties
- Clear separation of data fetching and presentation
- Conditional rendering based on state type

## State Management

Our application uses two primary state management approaches:

1. **TanStack Query** for server state:
   - Handles data fetching, caching, and synchronization
   - Provides loading/error/success states
   - Manages refetching and background updates
   - Orchestrates optimistic updates

2. **Zustand** for client-side state:
   - Manages UI preferences and filters
   - Persists state between navigation
   - Stores temporary form data
   - Handles global application state

These approaches are complementary, with TanStack Query handling server data and Zustand managing UI state that doesn't require server synchronization.

## Data Flow Example

Let's trace the complete data flow for displaying and releasing an envelope:

1. **Schema Definition**
   ```typescript
   // data/envelope/schema.ts
   export const envelopeSchema = z.object({ ... });
   export type EnvelopeDTO = z.infer<typeof envelopeSchema>;
   ```

2. **Contract Definition**
   ```typescript
   // data/envelope/contract.ts
   export const envelopeContract = c.router({
     getById: { ... },
     release: { ... },
   });
   ```

3. **Repository Implementation**
   ```typescript
   // data/envelope/repository.ts
   export class EnvelopeRepository {
     async getById(id: string): Promise<EnvelopeDTO | null> { ... }
     async release(envelopeId: string): Promise<EnvelopeDTO> { ... }
   }
   ```

4. **Manager Integration**
   ```typescript
   // features/envelope/manager.ts
   export class EnvelopeManager {
     async getEnvelopeById(envelopeId: string): Promise<Envelope | undefined> { ... }
     async releaseEnvelope(envelopeId: string): Promise<Envelope> { ... }
   }
   ```

5. **Query Hooks**
   ```typescript
   // features/envelope/queries.tsx
   export const EnvelopeQueries = {
     useDetail: (id: string): UseQueryResult<Envelope, Error> => { ... },
     useRelease: (): UseMutationResult<Envelope, Error, string, unknown> => { ... }
   };
   ```

6. **Custom UI Hook**
   ```typescript
   // features/envelope/use_envelope_details.tsx
   export const useEnvelopeDetail = (id: string) => {
     // Combine queries, handle mutations, and map to AsyncState
     return mapQueriesToAsyncState(...);
   };
   ```

7. **UI Component**
   ```tsx
   // features/envelope/detail_page.tsx
   function EnvelopeDetailPage() {
     const { id } = useParams<{ id: string }>();
     const state = useEnvelopeDetail(id!);
     
     // Render based on state type using type guards
     if (EnvelopeDetailSuccessState.is(state)) {
       // Access strongly-typed properties and methods
       return <Button onClick={() => state.release()}>Release</Button>;
     }
     
     // Handle other states...
   }
   ```

## Benefits and Best Practices

Our data fetching architecture provides several key advantages:

### Benefits

1. **Type Safety**: End-to-end type safety from API definition to UI
2. **Separation of Concerns**: Each layer has clear responsibilities
3. **Reusability**: Common patterns abstracted into reusable components
4. **Testability**: Each layer can be tested in isolation
5. **Maintainability**: Clear structure makes code easier to understand and modify
6. **Permission Control**: Centralized permission checks in the manager layer
7. **Caching**: Automatic caching and invalidation via TanStack Query
8. **Consistent UI States**: Standardized loading, error, and success states

### Best Practices

1. **Use Typed Query Keys**
   ```typescript
   // Define type-safe query keys
   export const QueryKeys = {
     Envelopes: {
       list: () => ["envelopes", "list"] as const,
       detail: (id: string) => ["envelopes", "detail", id] as const,
     }
   };
   ```

2. **Invalidate Related Queries**
   ```typescript
   // Define invalidation helpers
   export const Query = {
     Envelopes: {
       invalidateList: () => queryClient.invalidateQueries({ 
         queryKey: QueryKeys.Envelopes.list() 
       }),
     }
   };
   ```

3. **Extend Base States for Domain-Specific Logic**
   ```typescript
   // Create domain-specific state classes
   export class EnvelopeDetailSuccessState extends SuccessState<Envelope> {
     // Add domain-specific properties and methods
   }
   ```

4. **Use Type Guards for Safe Access**
   ```typescript
   // Use type guards in components
   if (isErrorState(state)) {
     return <ErrorMessage message={state.message} />;
   }
   ```

5. **Separate TanStack Queries from UI Hooks**
   ```typescript
   // Keep query definitions separate from UI logic
   const EnvelopeQueries = { useDetail: () => {...} };
   
   // Then combine in UI hooks
   const useEnvelopeDetail = (id: string) => {
     const query = EnvelopeQueries.useDetail(id);
     // Add UI-specific logic here
   };
   ```

6. **Use Query Builders for Complex Filters**
   ```typescript
   // Create complex queries with the builder pattern
   const builder = EnvelopeQueryBuilder.newInstance()
     .filterByAssignmentStatus(true)
     .orderBy("envelopeNumber", SortDirection.ASC)
     .paginate(1, 10);
   ```

7. **Handle Loading and Error States Consistently**
   ```tsx
   // Use consistent patterns for loading and error states
   if (isLoadingState(state)) {
     return <LoadingSpinner message={state.message} />;
   }
   
   if (isErrorState(state)) {
     return <ErrorAlert message={state.message} onRetry={() => state.retry()} />;
   }
   ```

By following these patterns consistently, we maintain a clean, predictable, and robust data flow from the API to the UI.