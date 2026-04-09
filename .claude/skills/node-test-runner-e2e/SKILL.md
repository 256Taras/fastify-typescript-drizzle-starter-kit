---
name: node-test-runner-e2e
description: E2E testing patterns using Node.js native test runner — createTestingApp, createDbHelper, factories, app.inject() for HTTP testing.
globs:
  - "tests/**/*.test.ts"
  - "tests/**/*.spec.ts"
  - "src/**/*.test.ts"
  - "src/**/*.spec.ts"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pnpm:*), Bash(ENV_NAME=test:*)
---

# Node.js Test Runner E2E Patterns

## Test Structure

```typescript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "#tests/helpers/index.ts";

describe("GET /v1/users", () => {
  let app, db, teardown;

  before(async () => {
    const ctx = await createTestContext();
    app = ctx.app;
    db = ctx.db;
    teardown = ctx.teardown;
  });

  beforeEach(async () => {
    await db.cleanUp();
  });

  after(async () => {
    await teardown();
  });

  it("[200] should return paginated users list", async () => {
    await db.seed(userFactory.createManySeed(3));

    const response = await app.inject({
      method: "GET",
      path: "/v1/users",
      query: { page: "1", limit: "10" },
    });

    assert.strictEqual(response.statusCode, 200);
    const body = response.json();
    assert.ok(Array.isArray(body.data));
    assert.strictEqual(body.data.length, 3);
  });
});
```

## Test Helpers

### createTestContext() — preferred
```typescript
const ctx = await createTestContext();
// Returns: { app, db, teardown }
```

### createTestingApp() — lower level
```typescript
const { app, database, teardown } = await createTestingApp();
const db = createDbHelper(database.drizzle);
```

### createDbHelper(drizzle)
- `db.cleanUp()` — truncates all tables (validates test DB name)
- `db.seed(seedConfig)` — inserts data: `{ table, data }`
- `db.seedMany(configs)` — multiple seeds
- `db.count(table)` — count rows
- `db.withTransaction(testFn)` — savepoint-based rollback

### userFactory
```typescript
import { userFactory } from "#tests/helpers/index.ts";

userFactory.create()              // single user object
userFactory.create({ role: "admin" }) // with overrides
userFactory.createMany(5)         // array of 5 users
userFactory.createSeed()          // { table, data } for db.seed()
userFactory.createManySeed(3)     // { table, data[] } for db.seed()
```

### authFactory
```typescript
import { authFactory } from "#tests/helpers/index.ts";

const auth = authFactory.for(user);
auth.accessToken          // JWT string
auth.refreshToken         // JWT string
auth.accessTokenHeader    // { authorization: "Bearer <token>" }
auth.authTokenSeed        // { table, data } for seeding auth tokens
```

### createEndpoint() — type-safe URL builder
```typescript
import { createEndpoint } from "#tests/helpers/index.ts";

const endpoint = createEndpoint("/v1/users/:id");
endpoint({ id: "123" }) // "/v1/users/123"
```

## Running Tests

```bash
pnpm test                          # all tests with coverage
pnpm test:unit                     # unit only
pnpm test:integration              # integration only
pnpm test:e2e                      # e2e only
ENV_NAME=test node --test <file>   # single file
```

## Hard Rules

- **Real database, real HTTP** — no mocking services
- **`db.cleanUp()` in `beforeEach`** — every test starts clean
- **`teardown()` in `after`** — close connections
- **`app.inject()`** for HTTP requests — not `fetch` or `supertest`
- **`assert` from `node:assert/strict`** — not chai, not jest
- **Test names include status code**: `[200] should return...`, `[404] should throw...`

## Anti-patterns

- Mocking repositories or services (use real implementations)
- Sharing state between tests (always cleanUp)
- Testing internal functions directly (test through API)
- Using `setTimeout` in tests (use proper async/await)
- Skipping teardown (leaks DB connections)
