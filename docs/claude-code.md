# Claude Code Configuration

This project has a complete `.claude/` setup that makes Claude Code aware of the project's architecture, conventions, and safety rules.

## Prerequisites

```bash
brew install jq   # Required by hooks (macOS)
# or: sudo apt install jq (Linux)
```

## Structure Overview

```
.claude/
├── REFLECTIONS.md              # Append-only lessons learned
├── SESSION_STATE.md            # Auto-populated session context
├── settings.json               # Permissions, hooks, MCP servers
├── .gitignore                  # Excludes ephemeral state
├── hooks/                      # Shell scripts for safety and automation
├── agents/                     # Specialized subagent definitions
├── skills/                     # Pattern libraries (auto-loaded by file glob)
└── commands/                   # Slash commands (/spec, /new-module, etc.)
PRPs/                           # Product Requirements Prompts (plans)
```

---

## Getting Started

1. **Start Claude Code** in the project root:
   ```bash
   claude
   ```

2. **SessionStart hook** fires automatically — populates `SESSION_STATE.md` with current branch, last commit, recent reflections.

3. **Work on a feature branch** — hooks block edits on `main`/`master`/`develop`:
   ```bash
   git checkout -b feature/my-task
   ```

4. **Use slash commands** for common workflows (see below).

---

## Slash Commands

### `/spec <ticket-id>`

Generates a PRP (plan) from a ticket. Invokes the `planner` subagent which reads the ticket from GitLab/Jira, explores the codebase, and writes a structured plan to `PRPs/`.

```
/spec PROJ-123
```

### `/new-module <name>`

Scaffolds all 9+ files for a new feature module, following the exact patterns from `src/modules/users/`:

```
/new-module orders
```

Creates: model, contracts, repository, queries, mutations, events, event-handlers, router, schemas, types.

### `/migration <description>`

Safe migration workflow:
1. Runs `pnpm db:generate`
2. Invokes `drizzle-migration-reviewer` agent to check for dangerous patterns
3. Requires explicit approval before edits are unlocked

```
/migration add-orders-table
```

### `/review-debate`

Multi-agent adversarial code review on your current diff:
1. **Defender** — argues why the code is correct
2. **Attacker** — finds edge cases, security issues, bugs
3. **Judge** — renders verdict: APPROVE / APPROVE_WITH_FIXES / REJECT

Use for critical changes (auth, payments, data migrations).

### `/event-trace <event-name>`

Traces a domain event from definition through emission to handling:

```
/event-trace USER_EVENTS.CREATED
```

Shows: where defined, where emitted, where handled, payload consistency, idempotency.

### `/reflect <domain> <lesson>`

Append a lesson to REFLECTIONS.md:

```
/reflect drizzle Always use isNull(deletedAt) in custom queries
```

### `/lock-test <path>`

Lock a test file so Claude cannot edit it (test-as-oracle pattern):

```
/lock-test tests/e2e/users/create-user.test.ts
```

Now tell Claude "make the implementation pass" — it physically cannot cheat by editing the test.

### `/bg-dev`

Start the dev server in background with live error monitoring:

```
/bg-dev
```

Claude sees runtime errors in real time and can fix them without you reporting them.

### `/standup`

Generate a 3-line daily standup from git activity.

### `/worktree <branch>`

Create a git worktree for parallel development (two Claude sessions).

---

## Hooks (Safety & Automation)

All hooks run automatically. You don't invoke them directly.

### Safety Hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| `pre-edit-guards.sh` | Before any file edit | Blocks edits on protected branches, migration files (without approval), and secrets (.env, .pem, .key) |
| `pre-bash-guards.sh` | Before any bash command | Blocks force push, destructive commands, and non-pnpm package managers |
| `pre-edit-test-lock.sh` | Before editing test files | Blocks edits on locked test files (test-as-oracle pattern) |

### Automation Hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| `post-edit-format.sh` | After any file edit | Auto-runs eslint --fix + prettier on the edited file |
| `session-start.sh` | Session start | Populates SESSION_STATE.md with branch, commits, reflections |
| `pre-compact-snapshot.sh` | Before context compression | Saves git diff/status/log to `.claude/.pre-compact-snapshot/` |
| `stop-final-checks.sh` | Before Claude stops | Runs tsc + eslint on changed files, asks to fix if errors |

### Learning Hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| `reflexion-on-failure.sh` | When a tool fails | Prompts Claude to write a lesson in REFLECTIONS.md |
| `cost-budget.sh` | Every prompt | Tracks daily prompt count, warns at 50/100/150/200 |
| `subagent-stop-summary.sh` | When subagent finishes | Logs subagent usage to `.claude/.logs/subagents.log` |

---

## Agents

Agents are specialized Claude instances with limited tools and focused prompts.

### Read-Only Research Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `planner` | sonnet | Generates PRPs from tickets. Never writes code. |
| `drizzle-migration-reviewer` | sonnet | Reviews migration SQL for production safety. Checks for dangerous patterns (NOT NULL without backfill, missing CONCURRENTLY, column drops). |
| `event-flow-tracer` | haiku | Traces domain events: definition, emission, handling. Checks payload consistency and handler idempotency. |
| `cradle-auditor` | haiku | Verifies Awilix DI container consistency — every auto-loaded file has a Cradle type declaration, no duplicates, no missing deps. |
| `layer-boundary-enforcer` | haiku | Checks architecture layers: Router, Queries/Mutations, Repository, DB. Finds forbidden imports (upward, cross-module). |
| `code-archaeologist` | haiku | Investigates code history via git log/blame. Outputs written understanding, not changes. |

### Code Review Trio

| Agent | Model | Role |
|-------|-------|------|
| `defender` | sonnet | Argues for the implementation's strengths |
| `attacker` | sonnet | Finds bugs, edge cases, security issues |
| `judge` | opus | Reads both reports, renders final verdict |

### Meta

| Agent | Model | Purpose |
|-------|-------|---------|
| `meta-agent` | sonnet | Generates new subagent definitions on demand |

---

## Skills

Skills auto-load based on which files you're editing (via `globs:` in frontmatter). You don't invoke them — they activate automatically.

| Skill | Activates on | What it teaches Claude |
|-------|-------------|----------------------|
| `awilix-di-patterns` | `src/modules/**/*.ts`, `src/libs/**/*.service.ts` | Cradle usage, partial application, type declarations, auto-loading conventions |
| `drizzle-query-patterns` | `src/modules/**/*.repository.ts`, `*.queries.ts` | NON_PASSWORD_COLUMNS, isNull(deletedAt), createBaseRepository, soft delete |
| `fastify-router-patterns` | `src/modules/**/*.router.v1.ts`, `*.schemas.ts` | TypeBox validation, DI access, domain errors, JWT guards |
| `cqs-mutations-queries` | `src/modules/**/*.mutations.ts`, `*.queries.ts`, `*.events.ts` | Queries are pure, mutations emit events after write, minimal payloads |
| `node-test-runner-e2e` | `tests/**/*.test.ts` | createTestingApp, createDbHelper, userFactory, authFactory, app.inject() |
| `drizzle-migration-safety` | `drizzle/**/*.sql` | Two-step NOT NULL, CONCURRENTLY indexes, expand-contract renames, forward-only mindset |

---

## REFLECTIONS.md

Append-only file where Claude records lessons from mistakes. Each line:

```
[2026-04-09] [drizzle] Always use isNull(deletedAt) in custom queries
```

This file is imported into every session via `@.claude/REFLECTIONS.md` in CLAUDE.md. Over time it becomes a project-specific knowledge base that prevents repeated mistakes.

---

## PRPs (Product Requirements Prompts)

Plans live in `PRPs/`. The working style rule is: **PRP or no work** — for anything beyond a 1-line fix, a plan must exist before implementation starts.

```
PRPs/
├── current.md              # Points to the active PRP (auto-updated by /spec)
└── PROJ-123-add-orders.md  # Example PRP
```

---

## Customization

### Adding a new agent

Use `/meta-agent` or manually create `.claude/agents/<name>.md` with frontmatter (`name`, `description`, `tools`, `model`, `mcpServers`).

### Adding a new skill

Create `.claude/skills/<name>/SKILL.md` with frontmatter including `globs:` — the skill auto-loads when you edit matching files.

### Adding a new command

Create `.claude/commands/<name>.md` with frontmatter (`description`, `allowed-tools`, optional `argument-hint`).

### Disabling a hook

Remove or comment out the hook entry in `.claude/settings.json` under `hooks`.

### MCP Servers

Configured in `.claude/settings.json` under `enabledMcpjsonServers`. Current: gitlab, jira, confluence, sentry, elk.

---

## Troubleshooting

### "BLOCKED: cannot edit on protected branch"

Switch to a feature branch: `git checkout -b feature/my-task`

### Hooks not firing

1. Check `jq` is installed: `which jq`
2. Check hooks are executable: `ls -la .claude/hooks/*.sh`
3. If not: `chmod +x .claude/hooks/*.sh`

### SESSION_STATE.md not updating

Restart Claude Code. The `session-start.sh` hook runs on every new session.

### Migration edit blocked

Run `/migration` command or invoke `drizzle-migration-reviewer` agent. After approval: `touch .claude/.migration-approved`

### Cost tracker reset

Delete `.claude/.cost-tracker` — it auto-recreates on next prompt.
