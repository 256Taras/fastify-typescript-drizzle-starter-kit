# Claude Code Workflows & Pipelines

> Practical step-by-step guides for every common development scenario.
> Each pipeline shows exact commands, which agents to use, and when.

---

## 1. Feature Development Pipeline

The full flow from ticket to merge request.

```
Ticket -> /spec -> PRP -> branch -> implement -> /bg-dev -> test -> /review-debate -> commit -> MR
```

### Steps

1. **Get the plan**
   ```
   /spec PROJ-123
   ```
   Planner agent reads the ticket, explores codebase, writes PRP to PRPs/.

2. **Review PRP** — read PRPs/current.md, approve or request changes.

3. **Create branch**
   ```bash
   git checkout -b feature/PROJ-123-add-orders
   ```

4. **Scaffold module** (if new module needed)
   ```
   /new-module orders
   ```
   Creates all 10 files following users/ reference.

5. **Start dev server**
   ```
   /bg-dev
   ```
   Live error monitoring — Claude sees errors in real time.

6. **Implement** following PRP steps. Claude uses skills auto-loaded by file type:
   - Editing *.repository.ts -> drizzle-query-patterns loads
   - Editing *.router.v1.ts -> fastify-router-patterns loads
   - Editing *.mutations.ts -> cqs-mutations-queries loads

7. **Write tests**
   ```
   /lock-test tests/e2e/orders/create-order.test.ts
   ```
   Then: "Implement so this test passes."

8. **Review** (for critical changes)
   ```
   /review-debate
   ```
   Defender, Attacker, Judge. Fix any MUST-FIX issues.

9. **Final checks**
   ```bash
   pnpm test && pnpm check:types && pnpm lint
   ```

10. **Commit and push**
    ```bash
    git add -A && git commit -m "feat(orders): add orders module"
    git push -u origin feature/PROJ-123-add-orders
    ```

11. **Reflect** if you learned something
    ```
    /reflect drizzle Remember to add index on FK columns
    ```

---

## 2. Bug Fix Pipeline

```
Sentry -> archaeologist -> branch -> fix -> test -> commit
```

### Steps

1. **Get error context** — check Sentry MCP for stack trace, affected users, frequency.

2. **Understand the code**
   ```
   @code-archaeologist Why does this function work this way?
   ```

3. **Create branch**
   ```bash
   git checkout -b fix/PROJ-456-null-pointer
   ```

4. **Fix** — Claude has context from Sentry + archaeologist.

5. **Test the exact scenario** that caused the bug.

6. **Reflect**
   ```
   /reflect auth Always check for null user before accessing properties
   ```

7. **Commit**
   ```bash
   git commit -m "fix(auth): handle null user in token refresh"
   ```

---

## 3. Database Migration Pipeline

```
Model change -> /migration -> reviewer -> approve -> apply -> test
```

### Steps

1. **Modify Drizzle model** in src/modules/<name>/<name>.model.ts

2. **Generate and review**
   ```
   /migration add-status-to-orders
   ```
   This:
   - Runs pnpm db:generate
   - Invokes drizzle-migration-reviewer (with postgres MCP for live schema checks)
   - Reports: APPROVE / REJECT / APPROVE_WITH_CONDITIONS

3. **If APPROVED** — unlock and apply
   ```bash
   touch .claude/.migration-approved
   pnpm db:migrate
   ```

4. **If REJECTED** — fix the model, re-generate, re-review.

### Dangerous Patterns the Reviewer Catches

| Pattern | Risk | Safe Alternative |
|---------|------|-----------------|
| NOT NULL on existing column | Fails on NULL rows | 2-step: nullable, backfill, alter |
| Index without CONCURRENTLY | Locks table | CREATE INDEX CONCURRENTLY |
| Column drop | Code still references it | 2-deploy: remove code, drop column |
| Column rename | Breaks running code | Expand-contract pattern |

---

## 4. New Module Pipeline

```
/new-module -> 10 files -> register -> migrate -> test
```

### Steps

1. **Scaffold**
   ```
   /new-module orders
   ```

2. **Claude asks**: entity fields? soft delete? auth-protected? relations?

3. **10 files created** following users/ reference:
   ```
   src/modules/orders/
   |- orders.model.ts           # 1. Drizzle schema
   |- orders.contracts.ts       # 2. TypeBox types
   |- orders.repository.ts      # 3. Data access
   |- orders.queries.ts         # 4. Read operations
   |- orders.mutations.ts       # 5. Write operations + events
   |- orders.events.ts          # 6. Event constants
   |- orders.event-handlers.ts  # 7. Event subscribers
   |- orders.router.v1.ts       # 8. HTTP routes
   |- orders.schemas.ts         # 9. Fastify validation
   |- orders.types.d.ts         # 10. Cradle declarations
   ```

4. **Register** table in db-schema.ts and table-names.ts

5. **Generate migration**: /migration add-orders-table

6. **Verify DI**
   ```
   @cradle-auditor
   ```

---

## 5. Code Review Pipeline

### Quick Review (routine changes)
```bash
git diff origin/main...HEAD
```

### Standard Review (most changes)
```
@api-contract-checker
@layer-boundary-enforcer
```

### Full Review (critical: auth, payments, migrations)
```
/review-debate
@security-auditor
@performance-profiler
```

### Decision Matrix

| Change Type | Agents to Run |
|------------|---------------|
| New route / endpoint | api-contract-checker |
| New module | cradle-auditor + layer-boundary-enforcer |
| Auth / JWT changes | security-auditor + review-debate |
| Database query changes | performance-profiler |
| Migration | drizzle-migration-reviewer |
| Production data touch | review-debate (full) |

---

## 6. Release Pipeline

```
audit -> gaps -> test -> types -> lint -> tag -> deploy
```

### Pre-Release Checklist

1. **Dependency audit**: `@dependency-auditor`
2. **Test coverage gaps**: `@test-gap-analyzer`
3. **Full test suite**: `pnpm test`
4. **Type check + lint**: `pnpm check:types && pnpm lint`
5. **Architecture check**: `@layer-boundary-enforcer` + `@cradle-auditor`
6. **Generate changelog**: `/standup`

---

## 7. Debugging Pipeline

```
error -> context -> reproduce -> fix -> test -> reflect
```

1. **Error details** — Sentry MCP for stack trace, ELK for logs.
2. **Trace event flow** (if event-related): `/event-trace ORDER_EVENTS.CREATED`
3. **Understand history**: `@code-archaeologist`
4. **Live monitoring**: `/bg-dev`
5. **Fix and watch** — dev server hot-reloads, Claude sees errors.
6. **Test the fix**
7. **Reflect**: `/reflect events Always check payload matches handler`

---

## 8. Onboarding Pipeline (New Team Member)

### Day 1: Understand
- Read CLAUDE.md, docs/claude-code.md, this file

### Day 2: Explore
- `/standup` — see recent activity
- `@code-archaeologist` — explore key modules
- `@cradle-auditor` — understand DI
- `@layer-boundary-enforcer` — understand architecture

### Day 3: First contribution
- Pick a small ticket, follow Feature Development Pipeline
- Use `/review-debate` for first MR

---

## 9. Multi-Agent Composition Patterns

### Sequential (most common)
```
planner -> implement -> review-debate
```

### Parallel (with Agent Teams)
```
defender --+
           +-- judge
attacker --+
```
Enabled via CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json.

### Layered Verification
```
api-contract-checker (schema)
  + layer-boundary-enforcer (architecture)
  + security-auditor (OWASP)
  + performance-profiler (N+1, indexes)
```

### Agent Selection Guide

| Question | Agent |
|----------|-------|
| What should I build? | planner |
| Is this secure? | security-auditor |
| Is this fast? | performance-profiler |
| Is this tested? | test-gap-analyzer |
| Are types consistent? | api-contract-checker |
| Are layers clean? | layer-boundary-enforcer |
| Is DI correct? | cradle-auditor |
| Where does this event go? | event-flow-tracer |
| Why is this code like this? | code-archaeologist |
| Is this merge-ready? | review-debate |
| Are deps healthy? | dependency-auditor |
| Is migration safe? | drizzle-migration-reviewer |

---

## 10. Daily Workflow

### Morning
```bash
claude                        # SessionStart hook fires
```
```
/standup                      # Yesterday/Today/Blockers
```
Check PRPs/current.md — active work?

### During Development
```
/bg-dev                       # Start once, leave running
```
Work on features. Skills auto-load. reflexion-on-failure catches mistakes.

### Before Commit
stop-final-checks runs tsc + eslint automatically.
For critical changes: `/review-debate`

### End of Day
```
/reflect <domain> <lesson>
```
SessionEnd hook logs stats to .claude/.logs/sessions.log.

### Weekly
```
@dependency-auditor
@test-gap-analyzer
@cradle-auditor
```


---

## 11. TDD Pipeline (Test-Driven Development)

```
Red: write failing test -> lock -> Green: implement minimum -> Refactor: clean up -> unlock
```

### The /tdd Command

```
/tdd tests/e2e/orders/create-order.test.ts
```

This starts a full TDD cycle:
1. Creates test file with skeleton
2. You define behaviors as test cases
3. Locks the test (Claude cannot edit it)
4. Runs test to confirm RED (all fail)
5. Claude implements minimum code to pass
6. Runs tests after each change until GREEN
7. Refactors with tests as safety net
8. Unlocks when done

### Three Phases

#### Phase 1: Red (define behavior)

Write tests that describe WHAT the code should do, not HOW:

```typescript
it("[201] should create order with valid items", async () => {
  const response = await app.inject({
    method: "POST",
    path: "/v1/orders",
    payload: { items: [{ productId: "...", quantity: 2 }] },
    headers: auth.accessTokenHeader,
  });
  assert.strictEqual(response.statusCode, 201);
  assert.ok(response.json().id);
});

it("[400] should reject order with empty items", async () => {
  const response = await app.inject({
    method: "POST",
    path: "/v1/orders",
    payload: { items: [] },
    headers: auth.accessTokenHeader,
  });
  assert.strictEqual(response.statusCode, 400);
});

it("[401] should require authentication", async () => {
  const response = await app.inject({
    method: "POST",
    path: "/v1/orders",
    payload: { items: [{ productId: "...", quantity: 1 }] },
  });
  assert.strictEqual(response.statusCode, 401);
});
```

Then lock:
```
/lock-test tests/e2e/orders/create-order.test.ts
```

Run to confirm all FAIL:
```bash
ENV_NAME=test node --test tests/e2e/orders/create-order.test.ts
```

#### Phase 2: Green (make it pass)

Tell Claude: "Make all tests pass with minimum implementation."

Claude will:
- Create route, mutation, repository as needed
- Run tests after each file
- Cannot touch the test file (locked)
- Stop when all tests pass

#### Phase 3: Refactor

All tests green. Now improve:
- Extract domain logic to *.domain.ts
- Add proper error messages
- Ensure events emit correctly
- Run tests after each change

Unlock when satisfied:
```bash
rm tests/e2e/orders/create-order.test.ts.lock
```

### TDD Rules

| Rule | Why |
|------|-----|
| Test first, always | Tests define the contract |
| Lock the test | Prevents "test was wrong, I fixed it" hallucinations |
| Minimum to pass | Don't over-engineer in Green phase |
| Refactor only when green | Never change structure of failing code |
| One behavior per test | Test names ARE the specification |

### When to Use TDD

| Scenario | Use TDD? |
|----------|----------|
| New mutation (create/update/delete) | Yes — define API contract first |
| New business rule | Yes — define expected behavior first |
| Bug fix | Yes — write test that reproduces the bug first |
| Simple CRUD endpoint | Optional — /new-module covers it |
| Refactoring existing code | Yes — lock existing tests first |
| UI component | Consider — Storybook stories serve as visual "tests" |

### Combining TDD with Other Workflows

```
/spec PROJ-123           # Plan the feature
/tdd tests/e2e/...       # Write tests from acceptance criteria
# ... implement ...
/review-debate            # Verify quality
git commit               # Ship it
```

The PRP's acceptance criteria become your test cases. This closes the loop:
**Ticket -> PRP -> Tests -> Implementation -> Review -> Ship**

---

## Quick Reference Card

| I want to... | Command/Agent |
|--------------|---------------|
| Plan a feature | `/spec PROJ-123` |
| Create a module | `/new-module orders` |
| Create a migration | `/migration add-orders` |
| Review my code | `/review-debate` |
| Trace an event | `/event-trace EVENT_NAME` |
| Lock a test | `/lock-test path/to/test.ts` |
| Start dev server | `/bg-dev` |
| Record a lesson | `/reflect domain lesson` |
| Get standup | `/standup` |
| Parallel work | `/worktree branch-name` |
| Check security | `@security-auditor` |
| Check performance | `@performance-profiler` |
| Check architecture | `@layer-boundary-enforcer` |
| Check DI | `@cradle-auditor` |
| Check deps | `@dependency-auditor` |
| Check test coverage | `@test-gap-analyzer` |
| Check API contracts | `@api-contract-checker` |
| Understand code history | `@code-archaeologist` |
| Create new agent | `@meta-agent` |
| Start TDD cycle | `/tdd path/to/test.ts` |
