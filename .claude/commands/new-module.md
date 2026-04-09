---
description: Scaffold a new feature module with all 9+ files following the project's 10-step workflow. Uses src/modules/users/ as reference.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
argument-hint: <module-name>
---

# /new-module — Scaffold a new feature module

Module name: `$ARGUMENTS`

## Steps

1. **Read the reference module** to understand exact patterns:
   - `src/modules/users/users.model.ts`
   - `src/modules/users/users.contracts.ts`
   - `src/modules/users/users.repository.ts`
   - `src/modules/users/users.queries.ts`
   - `src/modules/users/users.mutations.ts`
   - `src/modules/users/users.events.ts`
   - `src/modules/users/users.event-handlers.ts`
   - `src/modules/users/users.router.v1.ts`
   - `src/modules/users/users.schemas.ts`
   - `src/modules/users/users.types.d.ts`

2. **Ask me** before generating:
   - What entity fields does this module have?
   - Does it need soft delete?
   - Does it need auth-protected routes?
   - Does it need relations to other modules?

3. **Generate all files** in `src/modules/$ARGUMENTS/` following the 10-step workflow:
   1. `$ARGUMENTS.contracts.ts` — TypeBox contracts
   2. `$ARGUMENTS.model.ts` — Drizzle schema
   3. `$ARGUMENTS.repository.ts` — Data access with base repository
   4. `$ARGUMENTS.queries.ts` — Read operations
   5. `$ARGUMENTS.mutations.ts` — Write operations with events
   6. `$ARGUMENTS.events.ts` — Domain event constants
   7. `$ARGUMENTS.event-handlers.ts` — Event subscribers
   8. `$ARGUMENTS.router.v1.ts` — HTTP routes
   9. `$ARGUMENTS.schemas.ts` — Fastify validation schemas
   10. `$ARGUMENTS.types.d.ts` — Cradle type declarations

4. **Register the table** in `src/infra/database/db-schema.ts`.

5. **Add table name** to `src/infra/database/table-names.ts`.

6. **Add swagger tag** if needed.

7. **Generate migration**: `pnpm db:generate`.

8. Show me the file list and ask if I want to run `/migration` for review.

## Notes

- Every file must match the exact patterns from users module.
- Awilix auto-loads based on filename — no manual registration needed.
- The `*.types.d.ts` file IS required — TypeScript needs it for Cradle types.
