# 📁 Project Structure Documentation

## Root Structure
The project follows a feature-based organization within the `src` folder with clear separation of concerns:

```
src/
├── app/               # Application core setup
├── components/        # Shared UI components
├── constants/         # Global constants
├── data/             # Data access layer
├── factories/        # Factory patterns
├── hooks/            # Shared hooks
├── lib/              # Utility libraries
├── models/           # Domain models
├── pages/            # Route pages
└── utilities/        # Helper functions
```

## Key Directories Explained

### 📂 `data/` - Data Access Layer
```
data/
├── authentication/   # Auth-related data access
├── authorization/    # Permission management
├── church/          # Church-related operations
├── envelope/        # Envelope management
├── fellowship/      # Fellowship management
├── interest/        # Interest tracking
├── member/          # Member management
├── role/           # Role definitions
├── role-actions/   # Role permissions
├── shared/         # Shared data utilities
├── user/           # User management
└── volunteer/      # Volunteer management
```

Each data module contains:
- `*.api-contract.ts` - API endpoint definitions using `@ts-rest/core`
- `*.repository.ts` - Data access methods
- `*.schema.ts` - Data validation using `zod`
- `*.manager.ts` - Business logic layer
- `*.query-builder.ts` - Query construction
- `index.ts` - Public exports

### 📂 `components/` - UI Components
Organized by feature and shared components:
```
components/
├── fellowship/     # Fellowship-related components
├── form/          # Form components
├── layouts/       # Layout components
├── member/        # Member-related components
├── shared/        # Shared/common components
└── table/         # Table components
```

## Data Flow Pattern

The application follows a strict data flow pattern:

1. **Schema Definition** (Data Validation)
2. **Contract Definition** (API Endpoints)
3. **Repository Implementation** (Data Access)
4. **Manager Logic** (Business Rules)
5. **Query Hooks** (Data Fetching)
6. **UI Hooks** (Component Logic)
7. **Components** (UI Rendering)

## Feature Module Structure

Each feature follows this structure:
```
feature/
├── api-contract.ts     # API definitions
├── repository.ts       # Data access
├── schema.ts          # Data validation
├── manager.ts         # Business logic
├── query-builder.ts   # Query construction
└── index.ts          # Public exports
```

## Import Guidelines

1. Use absolute imports with `@/` prefix:
```typescript
import { Member } from "@/models";
import { MemberRepository } from "@/data/member";
```

2. Prefer importing from feature indices:
```typescript
// Good
import { memberQueries } from "@/data/member";

// Avoid
import { memberQueries } from "@/data/member/member.queries";
```

## Type Safety

- Use TypeScript throughout the codebase
- Leverage `zod` for runtime validation
- Define strict contracts with `@ts-rest/core`
- Utilize discriminated unions for state management

## State Management Strategy

1. **Server State** - `@tanstack/react-query`:
   - Data fetching and caching
   - Loading/error states
   - Background updates

2. **Client State** - `zustand`:
   - UI preferences
   - Form state
   - Local application state

## Testing Structure

```
src/
└── __tests__/
    ├── components/     # Component tests
    ├── hooks/         # Hook tests
    ├── managers/      # Business logic tests
    └── utils/         # Utility function tests
```

## Documentation

- Each feature folder should include a `README.md`
- API contracts should include JSDoc comments
- Complex business logic should be documented inline
- Types should be self-documenting with descriptive names