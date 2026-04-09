---
name: awilix-di-patterns
description: Awilix dependency injection patterns for this Fastify project — auto-loading conventions, Cradle usage, partial application, type declarations.
globs:
  - "src/modules/**/*.ts"
  - "src/libs/**/*.service.ts"
  - "src/libs/di-container/**/*.ts"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
---

# Awilix DI Patterns

## Auto-loading Convention

Files are auto-loaded by `@fastify/awilix` based on filename suffix:
- `*.repository.ts` → data access layer
- `*.queries.ts` → read operations (CQS Query)
- `*.mutations.ts` → write operations (CQS Command)
- `*.service.ts` → shared services

The Cradle key is the camelCase version of the filename:
- `users.repository.ts` → `usersRepository`
- `auth-token.service.ts` → `authTokenService`

## Export Pattern (mandatory)

Every auto-loaded file MUST export a default function that receives `Cradle` and returns an object:

```typescript
import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

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

Key points:
- `Cradle` is always the first parameter of internal functions
- Use `rambda.partial` for dependency pre-binding
- Default export is the factory function
- Internal functions are NOT exported individually

## Type Declaration (mandatory)

Every module MUST have a `*.types.d.ts` file declaring its Cradle extensions:

```typescript
import type usersMutations from "./users.mutations.ts";
import type usersQueries from "./users.queries.ts";
import type usersRepository from "./users.repository.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    usersMutations: ReturnType<typeof usersMutations>;
    usersQueries: ReturnType<typeof usersQueries>;
    usersRepository: ReturnType<typeof usersRepository>;
  }
}
```

## Accessing Dependencies

In router handlers:
```typescript
const { usersMutations, usersQueries } = app.diContainer.cradle;
```

In auto-loaded modules (via Cradle destructuring):
```typescript
const createOne = async ({ usersRepository, encrypterService, eventBus, logger }: Cradle, input: UserCreateInput) => {
  // deps are available via Cradle
};
```

## Base Dependencies (always available in Cradle)

From `src/libs/di-container/container.types.d.ts`:
- `app` — FastifyInstance
- `configs` — application configs
- `db` — Drizzle PostgresJsDatabase instance
- `jwtService` — JWT signing/verification
- `logger` — Pino logger
- `eventBus` — EventBus for domain events

## Anti-patterns

- Instantiating services directly instead of via Cradle
- Circular dependencies between modules (use events instead)
- Accessing `diContainer` inside auto-loaded modules (use Cradle parameter)
- Forgetting the `*.types.d.ts` declaration (TypeScript won't catch missing deps)
- Using `awilix.asClass` — this project uses `asFunction` exclusively
