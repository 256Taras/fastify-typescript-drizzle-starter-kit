---
description: Read a ticket and generate a PRP (Product Requirements Prompt) using the planner agent. Updates PRPs/current.md to point to the new PRP.
allowed-tools: Read, Write, Glob, Bash(git:*), Task
argument-hint: <ticket-id>
---

# /spec — Generate PRP from ticket

Ticket ID: `$ARGUMENTS`

## Steps

1. Invoke the `planner` subagent with this prompt:

> Fetch ticket `$ARGUMENTS` from available MCP (gitlab or jira). Read it carefully. Then explore the codebase to identify affected modules. Ask me clarifying questions if the ticket is genuinely ambiguous. Finally, write a complete PRP to `PRPs/$ARGUMENTS-<slug>.md` following the mandatory sections from the planner agent definition. Make sure to include all mandatory sections including Implementation steps following the 10-step workflow from CLAUDE.md.

2. After the planner returns, update `PRPs/current.md` to be a copy of the new PRP file content (so it gets imported into context via @PRPs/current.md).

3. Show me the path to the new PRP and the complexity estimate (S/M/L/XL).

4. Wait for my approval before any implementation begins.

## Notes

- The planner is read-only — it cannot start implementing.
- If `$ARGUMENTS` is empty, ask which ticket I want.
- If no MCP is available, ask me to paste the ticket content directly.
