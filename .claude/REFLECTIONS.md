# Reflections — Lessons Learned the Hard Way

> This file is **append-only**. Claude appends one line per mistake fixed.
> Read this at session start. These are your priors.
>
> Format: `[YYYY-MM-DD] [domain] one-sentence lesson, present tense, imperative`

## Examples (delete after first real entries)

[2026-04-09] [drizzle] Adding NOT NULL to existing column requires 2-step migration: add nullable + backfill + alter to NOT NULL
[2026-04-09] [awilix] Every *.repository/*.queries/*.mutations/*.service file MUST have a matching Cradle declaration in *.types.d.ts
[2026-04-09] [fastify] TypeBox schemas in *.schemas.ts must use the exact contract types from *.contracts.ts — no inline Type.Object
[2026-04-09] [drizzle] Always use isNull(deletedAt) in queries for soft-deletable tables — base repository handles it, custom queries do not
[2026-04-09] [events] Emit events AFTER successful DB write, never before — partial writes + emitted events = inconsistent state

## Real entries (append below)

