---
description: Start a TDD cycle — create test file, lock it, start implementation. Write the test first, then make it pass.
allowed-tools: Read, Write, Edit, Bash(touch:*), Bash(pnpm:*), Bash(ENV_NAME=test:*), BashOutput
argument-hint: <test-file-path>
---

# /tdd — Test-Driven Development Cycle

Test file: `$ARGUMENTS`

## Steps

### Phase 1: Red (write failing test)

1. If `$ARGUMENTS` does not exist, create it with the test skeleton:

```typescript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "#tests/helpers/index.ts";

describe("<MODULE> <ACTION>", () => {
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

  it("[200] should <expected behavior>", async () => {
    // TODO: write test
    assert.fail("Not implemented yet");
  });
});
```

2. Ask me to fill in the test cases (what behaviors to test).

3. After I confirm the test is ready, **lock it**:
   ```
   touch $ARGUMENTS.lock
   ```

4. **Run the test** to confirm it fails (Red phase):
   ```
   ENV_NAME=test node --test $ARGUMENTS
   ```
   Expected: all tests FAIL. If any pass before implementation, the test is wrong.

### Phase 2: Green (make it pass)

5. Tell me: "Test is locked. Now implement the minimum code to make all tests pass."

6. I will implement, running tests after each change:
   ```
   ENV_NAME=test node --test $ARGUMENTS
   ```

7. **Cannot edit the test** — pre-edit-test-lock.sh blocks it.

8. Repeat until all tests pass.

### Phase 3: Refactor

9. All tests green. Now refactor the implementation:
   - Extract functions, improve naming, remove duplication
   - Run tests after each refactor step to ensure nothing breaks

10. **Unlock the test** when done:
    ```
    rm $ARGUMENTS.lock
    ```

11. Optionally add edge case tests (new Red-Green-Refactor cycle).

## TDD Rules

- **Never write implementation before the test.**
- **Never edit a locked test.** If the test is wrong, unlock it explicitly.
- **Minimum code to pass.** Don't over-engineer in Green phase.
- **Refactor only when green.** Never refactor failing code.
- **One behavior per test.** Test names describe behavior, not implementation.

## Examples

```
/tdd tests/e2e/orders/create-order.test.ts
/tdd tests/e2e/users/update-user.test.ts
/tdd tests/unit/encryption/hash-password.test.ts
```
