# 📚 Data Fetching Architecture in React Application

This document outlines the comprehensive data-fetching architecture used in our React application, detailing the flow from API schema definitions to UI components.

---

## 📌 Table of Contents

- [📚 Data Fetching Architecture in React Application](#-data-fetching-architecture-in-react-application)
  - [📌 Table of Contents](#-table-of-contents)
  - [📐 Architecture Overview](#-architecture-overview)
  - [🗄️ Data Layer Components](#️-data-layer-components)
    - [🔹 Schemas](#-schemas)
    - [🔹 Contracts](#-contracts)
    - [🔹 Query Builders](#-query-builders)
    - [🔹 Repositories](#-repositories)
  - [🧠 Business Logic Layer](#-business-logic-layer)
    - [🔹 Managers](#-managers)
    - [🔹 Query Hooks](#-query-hooks)
  - [🎯 UI Integration](#-ui-integration)
    - [🔹 AsyncState Pattern](#-asyncstate-pattern)
    - [🔹 Extended Success States](#-extended-success-states)
    - [🔹 Mapping Query Results to AsyncState](#-mapping-query-results-to-asyncstate)
    - [🔹 Custom UI Hooks](#-custom-ui-hooks)
    - [🔹 UI Components](#-ui-components)
  - [🔄 State Management](#-state-management)
  - [🔎 Data Flow Example](#-data-flow-example)
  - [✅ Benefits and Best Practices](#-benefits-and-best-practices)
    - [🔸 Benefits](#-benefits)
    - [🔸 Best Practices](#-best-practices)

---

## 📐 Architecture Overview

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

---

## 🗄️ Data Layer Components

### 🔹 Schemas

* Defines the structure of our data models using **Zod**.
* Provides strong typing and validation.
* Serves as the single source of truth for entity structure.

```typescript
// data/envelope/schema.ts
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

---

### 🔹 Contracts

* Defines the API endpoints using `@ts-rest/core`.
* Strongly typed for both requests and responses.
* Handles runtime validation of API responses.

```typescript
// data/envelope/contract.ts
export const envelopeContract = c.router({
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
});
```

---

### 🔹 Query Builders

* Fluent interface for constructing complex queries.
* Encapsulates Objection's query logic.

```typescript
// data/envelope/query_builder.ts
export class EnvelopeQueryBuilder extends QueryBuilder {
  filterByEnvelopeNumber(number: number): this {
    return this.where("envelopeNumber", number);
  }
  
  filterByAssignmentStatus(isAssigned: boolean): this {
    return isAssigned ? this.whereNotNull("assignedAt") : this.whereNull("assignedAt");
  }

  configureForCount(): this {
    this.count("*");
    return this;
  }
  
  static from(
    options?: EnvelopeQueryCriteria | EnvelopeQueryBuilder,
  ): EnvelopeQueryBuilder {
    return new EnvelopeQueryBuilder(options);
  }
}
```

---

### 🔹 Repositories

* Handles API communication.
* Serializes query parameters.
* Normalizes API responses.

```typescript
// data/envelope/repository.ts
export class EnvelopeRepository extends BaseRepository<typeof envelopeContract> {
  constructor() {
    super("envelope", envelopeContract);
  }
  
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

  async getById(id: string): Promise<EnvelopeDTO | null> {
    const response = await this.client.get({
      path: `/${id}`,
    });
    return this.handleResponse(response, 200);
  }
}
```

---

## 🧠 Business Logic Layer

### 🔹 Managers

* Business logic layer that bridges Repositories and Query Hooks.
* Enforces permissions and converts DTOs to domain models.

```typescript
// features/envelope/manager.ts
export class EnvelopeManager {
  private static _instance: EnvelopeManager;
  private _repo: EnvelopeRepository;

  public static get instance(): EnvelopeManager {
    if (!EnvelopeManager._instance) {
      EnvelopeManager._instance = new EnvelopeManager(new EnvelopeRepository());
    }
    return EnvelopeManager._instance;
  }

  async getEnvelopeById(envelopeId: string): Promise<Envelope | undefined> {
    const dto = await this._repo.getById(envelopeId);
    return dto ? Envelope.fromDTO(dto) : undefined;
  }
}
```

---

### 🔹 Query Hooks

* Leverages TanStack Query for data fetching, caching, and state management.

```typescript
// features/envelope/queries.tsx
export const EnvelopeQueries = {
  useDetail: (id: string) => useQuery({
    queryKey: ['envelopes', id],
    queryFn: () => EnvelopeManager.instance.getEnvelopeById(id),
    enabled: !!id,
  })
};
```

## 🎯 UI Integration

### 🔹 AsyncState Pattern

The **AsyncState Pattern** uses class-based state representation to encapsulate UI states like `Loading`, `Error`, and `Success`, enhancing readability and maintainability of the UI state logic.

**Key components**:

```typescript
// Generic state classes for different UI states
export class LoadingState extends BaseState<UI_STATE_TYPE.LOADING> {
  constructor(public message?: string, public actions: LoadingStateActions = {}) {
    super(UI_STATE_TYPE.LOADING);
  }
}

interface EnvelopeDetailSuccessStateActions extends SuccessStateActions {
  assign: () => void;
  goBack: () => void;
}

export class SuccessState<T> extends BaseState<UI_STATE_TYPE.SUCCESS> {
  override actions: EnvelopeDetailSuccessStateActions;

  constructor(public data: T, public actions: EnvelopeDetailSuccessStateActions) {
    super(UI_STATE_TYPE.SUCCESS, actions);
  }
  
  refresh(): void {
    if (this.actions.refresh) {
      this.actions.refresh();
    }
  }
}
```

---

### 🔹 Extended Success States

Extended states for specific domain logic, like `EnvelopeDetailSuccessState`.

```typescript
// features/envelope/use_envelope_details.tsx
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

  static is(state: any): state is EnvelopeDetailSuccessState {
    return state.type === UI_STATE_TYPE.SUCCESS && "envelope" in state;
  }
}
```

---

### 🔹 Mapping Query Results to AsyncState

Utility function to map query results to `AsyncState`.

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

---

### 🔹 Custom UI Hooks

Custom UI hooks combine TanStack Query hooks with the AsyncState pattern to provide component-specific data and behaviors.

```typescript
// features/envelope/use_envelope_details.tsx
export const useEnvelopeDetail = (id: string) => {
  const navigate = useAppNavigation();
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

    await releaseMutation.mutateAsync(id, {
      onSuccess: () => {
        envelopeQuery.refetch();
        historyQuery.refetch();
      },
      onError: (error) => {
        console.error('Failed to release envelope:', error);
        throw error;
      }
    });
  }, [id, releaseMutation, envelopeQuery, historyQuery]);
  
  const handleAssign = useCallback(() => {
    navigate.Envelopes.toAssign(id);
  }, [id, navigate]);
  
  return mapQueryToAsyncState(
    envelopeQuery, 
    {
      loadingMessage: "Loading envelope details...",
      onSuccess: (envelope) => new EnvelopeDetailSuccessState({
        data: envelope,
        history: historyQuery.data ?? [],
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
      })
    }
  );
};
```

---

### 🔹 UI Components

UI components consume the custom hooks and render based on the current `AsyncState`.

```tsx
// features/envelope/detail_page.tsx
function EnvelopeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const state = useEnvelopeDetail(id!);

  return (
    <div className="envelope-detail-page">
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
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
          },
        }}
      />
    </div>
  );
}
```

---

## 🔄 State Management

Our application uses two primary state management strategies:

1. **TanStack Query** - For server state:

   * Handles data fetching, caching, and synchronization.
   * Provides loading/error/success states.
   * Manages refetching and background updates.

2. **Zustand** - For client-side state:

   * Manages UI preferences and filters.
   * Persists state between navigation.
   * Stores temporary form data.

---

## 🔎 Data Flow Example

1. **Schema Definition** → 2. **Contract Definition** → 3. **Repository Implementation** → 4. **Manager Logic** → 5. **Query Hook** → 6. **Custom UI Hook** → 7. **UI Component**

---

## ✅ Benefits and Best Practices

### 🔸 Benefits

* Type Safety
* Separation of Concerns
* Reusability
* Testability
* Maintainability
* Permission Control
* Caching
* Consistent UI States

---

### 🔸 Best Practices

* Use Typed Query Keys
* Invalidate Related Queries
* Extend Base States for Domain Logic
* Use Type Guards for Safe Access
* Separate Queries from UI Hooks
* Use Query Builders for Complex Filters
* Consistent Loading & Error Handling
