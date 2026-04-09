---
description: Trace a domain event from definition through emission to handling. Shows the complete flow diagram.
allowed-tools: Read, Grep, Glob, Task
argument-hint: <event-name>
---

# /event-trace — Trace domain event flow

Event name: `$ARGUMENTS`

## Steps

1. Invoke the `event-flow-tracer` subagent with this prompt:

> Trace the domain event `$ARGUMENTS` across the codebase. Find: where it's defined (*.events.ts), where it's emitted (*.mutations.ts), where it's handled (*.event-handlers.ts). Check payload consistency between emit and handler. Check handler idempotency. Output a flow diagram.

2. Show me the flow diagram and any issues found.

## Examples

```
/event-trace USER_EVENTS.CREATED
/event-trace users.created
/event-trace AUTH_EVENTS.SIGNED_UP
```
