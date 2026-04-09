---
description: Generate a Drizzle migration with mandatory drizzle-migration-reviewer approval before edit.
allowed-tools: Bash(pnpm:*), Bash(touch:*), Read, Glob, Task
argument-hint: <migration-description>
---

# /migration — Safe migration workflow

Description: `$ARGUMENTS`

## Steps

1. **Generate the migration SQL**:
   ```
   pnpm db:generate
   ```

2. **Find the newly generated file**: Glob `drizzle/migrations/*.sql` — pick the most recent.

3. **Read the migration SQL** to show me what was generated.

4. **Invoke the `drizzle-migration-reviewer` subagent**:

> Review the migration file just generated. Check for: NOT NULL on existing columns without backfill, large table locks without CONCURRENTLY, missing indexes on foreign keys, column drops still referenced in code, column renames in one step. Render a verdict: APPROVE / REJECT / APPROVE_WITH_CONDITIONS.

5. **If APPROVED**: instruct me to run `touch .claude/.migration-approved` to unlock the edit hook for one operation. Then apply with `pnpm db:migrate`.

6. **If REJECTED**: show me the required changes. Offer to fix the model and re-generate.

## Hard rules

- The migration file is locked by `pre-edit-guards.sh` until `.claude/.migration-approved` exists.
- The marker is auto-deleted after one edit.
- Never bypass this with `--dangerously-skip-permissions`.
