---
name: cqs-mutations-queries
description: CQS (Command Query Separation) patterns — mutations for writes with events, queries for reads without side effects.
globs:
  - "src/modules/**/*.mutations.ts"
  - "src/modules/**/*.queries.ts"
  - "src/modules/**/*.events.ts"
  - "src/modules/**/*.event-handlers.ts"
  - "src/modules/**/*.domain.ts"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
---

# CQS Mutations & Queries

## Queries — Pure Read Operations

```typescript
import type { UUID } from "node:crypto";
import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";
import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const findOneById = async ({ usersRepository, logger }: Cradle, userId: UUID): Promise<User> => {
  logger.debug(`[UsersQueries] Getting user: ${userId}`);
  const user = await usersRepository.findOneById(userId);
  if (!user) throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  return user;
};

export default function usersQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
  };
}
```

Rules for queries:
- **No side effects**: no DB writes, no events, no external calls
- **Throw ResourceNotFoundException** if entity not found
- **Logging**: `logger.debug` with `[ModuleQueries]` prefix
- **Return domain types** (not raw DB rows)

## Mutations — Write Operations with Events

```typescript
import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";
import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import { USER_EVENTS } from "./users.events.ts";

const createOneUser = async (
  { usersRepository, encrypterService, eventBus, logger }: Cradle,
  input: UserCreateInput,
): Promise<User> => {
  logger.debug(`[UsersMutations] Creating user: ${input.email}`);

  // 1. Validate business rules
  const existing = await usersRepository.findOneByEmail(input.email);
  if (existing) throw new ConflictException(`User with email: ${input.email} already exists`);

  // 2. Transform data
  const hashedPassword = await encrypterService.getHash(input.password);

  // 3. Persist
  const newUser = await usersRepository.createOne({ ...input, password: hashedPassword });

  // 4. Emit event AFTER successful write
  await eventBus.emit(USER_EVENTS.CREATED, { userId: newUser.id });

  // 5. Log success
  logger.info(`[UsersMutations] User created: ${newUser.id}`);

  return newUser;
};

export default function usersMutations(deps: Cradle) {
  return {
    createOne: partial(createOneUser, [deps]),
  };
}
```

Rules for mutations:
- **Validate first**: check business rules before writing
- **Events AFTER write**: emit domain events only after successful DB operation
- **Logging**: `logger.debug` on entry, `logger.info` on success, with `[ModuleMutations]` prefix
- **Return the created/updated entity** (not just ID)
- **Minimal event payload**: `{ userId: string }` — handlers fetch fresh data if needed

## Domain Events

```typescript
// users.events.ts
export const USER_EVENTS = {
  CREATED: "users.created",
  UPDATED: "users.updated",
  DELETED: "users.deleted",
} as const;
```

Convention: `<module>.<action>` in lowercase dot-notation.

## Event Handlers

```typescript
// users.event-handlers.ts
import type { Cradle } from "@fastify/awilix";
import { USER_EVENTS } from "./users.events.ts";

export default function setupUsersEventHandlers({ eventBus, logger }: Cradle): void {
  eventBus.on(USER_EVENTS.CREATED, async (payload: { userId: string }): Promise<void> => {
    logger.info(`[UsersEventHandlers] User created: ${payload.userId}`);
    // Trigger side effects: send welcome email, create audit log, etc.
  });
}
```

Rules for event handlers:
- Idempotent when possible (guard against duplicate processing)
- Keep handler logic minimal — delegate to services
- Log on entry with `[ModuleEventHandlers]` prefix

## Domain Logic (*.domain.ts)

Pure functions for business rules, extracted from mutations:

```typescript
// users.domain.ts
export const isEmailTakenByOtherUser = (existingUser: User | undefined, currentUserId: UUID): boolean =>
  existingUser !== undefined && existingUser.id !== currentUserId;
```

## Anti-patterns

- Queries that emit events or write to DB
- Mutations that skip event emission after writes
- Events emitted BEFORE the DB write succeeds
- Fat event payloads (send ID, let handler fetch what it needs)
- Business logic in router handlers instead of mutations
- Direct cross-module repository calls instead of events
