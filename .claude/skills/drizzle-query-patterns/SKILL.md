---
name: drizzle-query-patterns
description: Drizzle ORM query patterns for this project — base repository, soft delete, NON_PASSWORD_COLUMNS, query builder conventions.
globs:
  - "src/modules/**/*.repository.ts"
  - "src/modules/**/*.queries.ts"
  - "src/infra/database/**/*.ts"
  - "src/libs/persistence/**/*.ts"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
---

# Drizzle Query Patterns

## Base Repository

Use `createBaseRepository` from `#libs/persistence/base-repository.ts` for standard CRUD:

```typescript
import { createBaseRepository } from "#libs/persistence/base-repository.ts";

export default function usersRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof users, User, UserInsert>({
    table: users,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: NON_PASSWORD_COLUMNS,
    softDeleteColumn: "deletedAt",
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    softDeleteOneById: baseRepo.softDeleteOneById,
    // Custom methods below...
    findOneByEmail: partial(findOneByEmail, [deps]),
  };
}
```

Base repository provides: `createOne`, `createMany`, `findOneById`, `findManyByIds`, `softDeleteOneById`, `softDeleteManyByIds`, `deleteOneById`, `deleteManyByIds`.

## NON_PASSWORD_COLUMNS (mandatory for User)

Never return password in queries:

```typescript
import { getTableColumns } from "drizzle-orm";
import { omit } from "rambda";

export const NON_PASSWORD_COLUMNS = omit(["password"], getTableColumns(users));
```

Use in custom queries:
```typescript
const [user] = await db
  .select(NON_PASSWORD_COLUMNS)
  .from(users)
  .where(and(eq(users.email, email), isNull(users.deletedAt)));
```

## Soft Delete (mandatory)

Every query on soft-deletable tables MUST include `isNull(deletedAt)`:

```typescript
import { and, eq, isNull } from "drizzle-orm";

// Base repository handles this automatically via softDeleteColumn option
// Custom queries MUST add it manually:
const [user] = await db
  .select(NON_PASSWORD_COLUMNS)
  .from(users)
  .where(and(eq(users.id, id), isNull(users.deletedAt)));
```

## Custom Query Pattern

```typescript
const findOneByEmail = async ({ db }: Cradle, email: string): Promise<undefined | User> => {
  const [maybeUser] = await db
    .select(NON_PASSWORD_COLUMNS)
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return maybeUser;
};
```

Key points:
- Return `undefined | Entity` for single results (not null)
- Destructure only needed deps from Cradle
- Always include `isNull(deletedAt)` for soft-deletable tables
- Use `NON_PASSWORD_COLUMNS` for user queries

## Update Pattern

```typescript
const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<UserInsert, "id" | "createdAt" | "updatedAt" | "deletedAt">>,
): Promise<undefined | User> => {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return updated;
};
```

## Model Definition Pattern

```typescript
export const users = pgTable(
  TABLE_NAMES.users,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    email: varchar("email", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }).$type<DateTimeString>(),
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    index("users_deleted_at_email_idx").on(table.deletedAt, table.email),
  ],
);
```

## Transaction Context

For request-scoped transactions, use `getTransactionContext()` from `#libs/persistence/transaction-context.ts`. The base repository handles this automatically via `getDb()`.

## Anti-patterns

- Returning password fields in any query (use `NON_PASSWORD_COLUMNS`)
- Forgetting `isNull(deletedAt)` in custom queries
- Using raw SQL when Drizzle query builder suffices
- Full table scans without proper WHERE clauses
- Missing indexes on frequently queried columns
