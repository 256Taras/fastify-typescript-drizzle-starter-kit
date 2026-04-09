---
description: Append a lesson to .claude/REFLECTIONS.md. Use when you realize something the hard way and want to remember it.
allowed-tools: Read, Edit, Bash(date:*)
argument-hint: <domain> <lesson>
---

# /reflect — Append a lesson

Domain: extract from `$ARGUMENTS` (first word)
Lesson: rest of `$ARGUMENTS`

## Steps

1. Read current `.claude/REFLECTIONS.md`
2. Append a new line in format: `[YYYY-MM-DD] [domain] lesson` (use today's date via `date +%Y-%m-%d`)
3. Show me the appended line and the last 5 entries for context.

## Examples

```
/reflect drizzle Adding NOT NULL needs 2-step migration
/reflect awilix Every auto-loaded file needs matching Cradle declaration
/reflect events Emit events AFTER successful DB write, never before
```
