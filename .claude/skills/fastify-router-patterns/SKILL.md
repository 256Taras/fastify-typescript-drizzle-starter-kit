---
name: fastify-router-patterns
description: Fastify route handler patterns — TypeBox validation, DI access, schema definitions, JWT guards, error handling conventions.
globs:
  - "src/modules/**/*.router.v1.ts"
  - "src/modules/**/*.schemas.ts"
  - "src/modules/**/*.contracts.ts"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*)
---

# Fastify Router Patterns

## Router Structure

```typescript
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import usersSchemas from "./users.schemas.ts";

const usersRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { usersMutations, usersQueries } = app.diContainer.cradle;

  app.get("/", {
    schema: usersSchemas.getList,
    async handler(req) {
      const pagination = app.transformers.getPaginationQuery(req);
      return usersQueries.findMany(pagination);
    },
  });

  app.post("/", {
    schema: usersSchemas.create,
    async handler(req, rep) {
      const user = await usersMutations.createOne(req.body);
      rep.status(201);
      return user;
    },
  });
};

export default usersRouterV1;
```

Key points:
- Type: `FastifyPluginAsyncTypebox`
- Get dependencies from `app.diContainer.cradle` at the top
- Schema object per route from `*.schemas.ts`
- Router is thin — delegates to queries/mutations
- No business logic in router
- No try/catch — let Fastify error handler deal with domain errors

## JWT Protected Routes

```typescript
app.get("/profile", {
  preHandler: app.auth([app.verifyJwt]),
  schema: usersSchemas.getProfile,
  handler: () => usersQueries.getOneProfile(),
});
```

## Schema Definitions (*.schemas.ts)

```typescript
import { USER_CREATE_INPUT_CONTRACT, USER_OUTPUT_CONTRACT } from "./users.contracts.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";

const usersSchemas = {
  create: {
    tags: SWAGGER_TAGS.USERS,
    body: USER_CREATE_INPUT_CONTRACT,
    description: "Create a new user",
    response: {
      201: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Create user",
  },
};
```

## TypeBox Contracts (*.contracts.ts)

```typescript
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const USER_ENTITY_CONTRACT = createSelectSchema(users, { id: TypeUuid() });
export const USER_OUTPUT_CONTRACT = Type.Omit(USER_ENTITY_CONTRACT, ["deletedAt", "password"]);
export const USER_CREATE_INPUT_CONTRACT = Type.Omit(USER_INSERT_CONTRACT, ["id", "createdAt", "updatedAt", "deletedAt"]);

export type User = Static<typeof USER_OUTPUT_CONTRACT>;
export type UserCreateInput = Static<typeof USER_CREATE_INPUT_CONTRACT>;
```

## Error Handling

Throw domain errors — they map to HTTP automatically via `fastify-error-handler.ts`:

```typescript
import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

// In mutations/queries — NOT in router
if (!user) throw new ResourceNotFoundException(`User with id: ${id} not found`);
if (existing) throw new ConflictException(`User with email: ${email} already exists`);
```

Available domain errors:
- `BadRequestException` → 400
- `UnauthorizedException` → 401
- `ForbiddenException` → 403
- `ResourceNotFoundException` → 404
- `ConflictException` → 409
- `UnprocessableEntityException` → 422

## Route Versioning

Routes are versioned via filename: `*.router.v1.ts`. Future versions: `*.router.v2.ts`.

## Anti-patterns

- Business logic in route handlers (move to mutations/queries)
- Try/catch around domain errors in handlers (let error handler do it)
- Inline TypeBox schemas in router (move to `*.schemas.ts`)
- Direct DB access in router (use queries/mutations via Cradle)
- Manual response status codes except for 201 on POST creation
