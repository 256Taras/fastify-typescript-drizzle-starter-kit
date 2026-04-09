---
name: drizzle-migration-safety
description: Safe Drizzle ORM migration patterns for PostgreSQL. Auto-loads on migration files. Mandatory reading before writing or editing a migration.
globs:
  - "drizzle/**/*.sql"
  - "drizzle/migrations/**/*"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
---

# Drizzle Migration Safety

## The First Rule

**Migrations affect production data.** Drizzle has NO down migrations — forward-only SQL. A bad migration cannot be undone by `git revert`. It can be undone only by writing another migration. Slow down here.

## Workflow

```bash
# 1. Modify Drizzle model in src/modules/*/*.model.ts
# 2. Generate migration SQL
pnpm db:generate

# 3. Review the generated SQL in drizzle/migrations/
# 4. Run /migration command to invoke drizzle-migration-reviewer

# 5. If approved: apply
pnpm db:migrate

# For dev only (no migration file, direct push):
pnpm db:push
```

## Mandatory Checks Before Writing

1. For any column change, estimate row count — large tables need special handling
2. For any constraint addition, check for violations first
3. For any drop, verify no code references it (Grep)

## Two-step Pattern: Adding NOT NULL to Existing Column

NEVER do this in one migration:
```sql
-- WRONG: fails on existing rows with NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

DO this in two separate migrations + a backfill:

**Migration 1** — Add column as nullable (or ensure it's already nullable)

**Backfill** — Update existing NULL rows:
```sql
UPDATE users SET email = 'legacy-' || id || '@unknown.local' WHERE email IS NULL;
```

**Migration 2** — Alter to NOT NULL:
```sql
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

Each migration deploys separately. Verify backfill in production before applying Migration 2.

## Index Creation on Large Tables

Always use `CONCURRENTLY` for PostgreSQL:
```sql
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
```

Without `CONCURRENTLY`, PostgreSQL locks the table for writes during index creation.

## Renaming Columns

NEVER rename in one step. Use expand-contract across multiple deploys:
1. Migration 1: add new column, copy data
2. Deploy: code reads from new column, writes to both
3. Migration 2: drop old column

## Foreign Keys Must Have Indexes

Always pair FK with an index on the FK column:
```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
```

## Soft Delete Column Convention

Always: `deleted_at TIMESTAMP NULL` (matches Drizzle model `deletedAt`).

## Hard Rules

- Drizzle generates forward-only SQL — there is no `down()`. Be extra cautious.
- Never alter and backfill in the same migration
- Never combine multiple unrelated changes in one migration
- Test migration on a copy of production data before merging
- Always invoke `drizzle-migration-reviewer` agent before committing (enforced by hook)
- The `pre-edit-guards.sh` hook blocks direct edits to `drizzle/migrations/` without `.claude/.migration-approved`

## Anti-patterns

- "Quick migration" — there is no such thing
- Using `pnpm db:push` in production (use `pnpm db:migrate`)
- Migrations that depend on application code state
- Catch-all migrations that change 5 unrelated tables
- Adding NOT NULL to existing column without backfill
- Creating indexes without CONCURRENTLY on production tables
