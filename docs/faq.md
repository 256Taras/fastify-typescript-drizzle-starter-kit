# FAQ

## Architecture

**Is DDD mandatory?**

No. This is an N-Layer architecture with CQS-like separation. Use DDD patterns (aggregates, entities, value objects) only when domain complexity justifies it.

**Can modules be nested?**

Yes. Example: `orders/` with `order-items/` inside as aggregate + entity. Valid when entities are tightly coupled and always accessed together. Avoid nesting for simple CRUD modules.

**What's the difference between queries and mutations?**

- **Queries** (`*.queries.ts`) - read operations, no side effects, no events
- **Mutations** (`*.mutations.ts`) - write operations, emit domain events

**When should I create a new module vs extend existing?**

Create new module when:

- Entity has its own lifecycle
- Can exist independently
- Has distinct business rules

Extend existing when entities are tightly coupled (e.g., `order-items` inside `orders`).

**What goes in `libs/` vs `modules/`?**

- `libs/` - reusable utilities, cross-cutting concerns (auth, logging, pagination)
- `modules/` - business domain logic, specific to your application

**Why separate `contracts.ts` and `schemas.ts`?**

- `contracts.ts` - TypeBox types, reusable across codebase
- `schemas.ts` - Fastify route schemas with descriptions for OpenAPI

**What is the repository pattern for?**

Abstracts database access. Allows changing ORM without touching business logic. Keep SQL/Drizzle queries only in repositories.

**Should I use services or queries/mutations?**

Prefer queries/mutations. Use `*.service.ts` only for shared logic used by multiple modules (e.g., email service, encryption).

## Code Style

**Is JSDoc required?**

No. TypeScript types are self-documenting. Avoid JSDoc in this project.

**Should I add comments?**

Only when explaining "why", not "what". Code should be self-explanatory.

**How to name files?**

| Pattern | Purpose |
|---------|---------|
| `*.model.ts` | Drizzle schema |
| `*.contracts.ts` | TypeBox types |
| `*.schemas.ts` | Route validation |
| `*.router.v1.ts` | HTTP endpoints |
| `*.queries.ts` | Read operations |
| `*.mutations.ts` | Write operations |
| `*.repository.ts` | Data access |
| `*.events.ts` | Event constants |
| `*.event-handlers.ts` | Event subscribers |
| `*.types.d.ts` | Type definitions |

**How to name functions?**

- Queries: `findById`, `findByEmail`, `listAll`, `search`
- Mutations: `create`, `update`, `delete`, `softDelete`
- Booleans: `isActive`, `hasAccess`, `canDelete`

**When to use `Type.Optional()` vs required fields?**

Required by default. Use `Type.Optional()` only for truly optional fields (e.g., `middleName`, `avatar`).

## Database

**Why Drizzle instead of TypeORM/Prisma?**

- Type-safe SQL queries
- No magic, explicit queries
- Better performance
- Simpler mental model

**How to add a new table?**

1. Create `*.model.ts` with Drizzle schema
2. Register in `src/infra/database/db-schema.ts`
3. Run `pnpm db:generate` and `pnpm db:push`

**How to handle migrations?**

- Development: `pnpm db:push` (quick, no migration files)
- Production: `pnpm db:generate` + `pnpm db:migrate` (versioned migrations)

**What is soft delete?**

Instead of deleting rows, set `deletedAt` timestamp. Preserves data for auditing. Filter with `isNull(deletedAt)` in queries.

**How to use transactions?**

Use `unitOfWork` service for operations that must succeed or fail together:

```typescript
const result = await unitOfWork.execute(async (tx) => {
  const order = await ordersRepository.create(tx, orderData);
  await orderItemsRepository.createMany(tx, order.id, items);
  await paymentsRepository.create(tx, order.id, paymentData);
  return order;
});
```

If any operation fails, all changes are rolled back automatically.

**When to use transactions?**

- Creating related entities (order + items + payment)
- Transferring between accounts (debit + credit)
- Any operation where partial success is invalid

**Can I nest transactions?**

No. Pass the transaction context (`tx`) through all repository calls within the same transaction.

## Testing

**Are tests mandatory?**

No. Write tests for critical paths and complex logic. Don't chase coverage metrics.

**What test types are supported?**

- `tests/unit/` - mocked dependencies, fast, no database
- `tests/integration/` - with database, test repositories
- `tests/e2e/` - full API tests via HTTP

**How to run tests?**

```bash
pnpm test              # All tests with coverage
pnpm test:unit         # Unit only
pnpm test:integration  # Integration only
pnpm test:e2e          # E2E only
```

**Should I mock the database in tests?**

- Unit tests: yes, mock everything
- Integration/E2E: no, use real database (test container)

## Development

**How to run locally?**

Database in Docker, server locally. Faster iteration than full Docker setup.

```bash
pnpm dc:infra        # Start PostgreSQL
pnpm dev             # Start server
```

**How to add environment variables?**

1. Add to `src/configs/env.config.ts` schema
2. Add to `configs/.env.example`
3. Add to your local `configs/.env`
4. Update `docs/env.md`

**What is the DI container for?**

Awilix injects dependencies automatically based on file naming:

- `*.repository.ts` → available as `usersRepository`
- `*.queries.ts` → available as `usersQueries`
- `*.mutations.ts` → available as `usersMutations`

Access via `app.diContainer.cradle`.

**How to debug?**

Set `ENABLE_DEBUG=1` in `.env`. Use VS Code debugger with provided launch configurations.

## Events

**When to use domain events?**

For side effects that shouldn't block the main operation:

- Send email after registration
- Update stats after purchase
- Log audit trail

**Are events synchronous or async?**

Synchronous (EventEmitter). For async processing, consider adding a job queue later.

**What if event handler fails?**

Currently no retry mechanism. Keep handlers simple and idempotent. For critical operations, use transactions instead.

## Errors

**Operational vs Programmer errors?**

- **Operational**: runtime problems (network, timeout, invalid input) - handle gracefully
- **Programmer**: bugs (undefined access, wrong types) - fix the code

**Which error class to use?**

| Error | HTTP | Use case |
|-------|------|----------|
| `BadRequestException` | 400 | Invalid input |
| `UnauthorizedException` | 401 | Not authenticated |
| `ForbiddenException` | 403 | No permission |
| `ResourceNotFoundException` | 404 | Entity not found |
| `ConflictException` | 409 | Duplicate, conflict |
| `UnprocessableEntityException` | 422 | Validation failed |

**How does error handling work?**

1. Throw domain errors in mutations/queries
2. Global error handler catches and formats response
3. In development: full error details + stack trace
4. In production: safe message only, no internals exposed

```typescript
// In mutation
if (!user) {
  throw new ResourceNotFoundException("User not found");
}

// Response (development)
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "User not found",
  "stack": "..." // only in dev
}
```

**Should I try-catch everywhere?**

No. Let errors bubble up to the global handler. Use try-catch only when you need to:

- Transform errors
- Add context
- Recover and continue

## File Uploads

**How to handle file uploads?**

Don't upload files through your API. Use presigned URLs:

1. Client requests presigned URL from your API
2. Your API generates URL via AWS S3 / GCS / etc.
3. Client uploads directly to cloud storage
4. Client sends file metadata to your API

**Why presigned URLs?**

- No server load for large files
- Direct cloud upload (faster)
- No file size limits on your server
- Better scalability

**Example flow:**

```typescript
// 1. Client requests upload URL
POST /api/uploads/presign
{ "filename": "photo.jpg", "contentType": "image/jpeg" }

// 2. Server generates presigned URL
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/...",
  "fileKey": "uploads/abc123.jpg"
}

// 3. Client uploads directly to S3
PUT https://s3.amazonaws.com/bucket/... (file binary)

// 4. Client confirms upload
POST /api/files
{ "fileKey": "uploads/abc123.jpg", "originalName": "photo.jpg" }
```

## Performance

**Is this production-ready?**

Yes. Fastify is one of the fastest Node.js frameworks. Includes rate limiting, compression, proper error handling.

**How to monitor performance?**

Prometheus metrics at `/api/metrics`. Set `METRICS_API_KEY` in production.

**Should I add caching?**

Not included by default. Add Redis when needed for specific use cases.
