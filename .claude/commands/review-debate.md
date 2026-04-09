---
description: Multi-agent code review debate. Runs defender, attacker, and judge subagents in sequence on the current diff. Use for critical changes (auth, payments, migrations).
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(mkdir:*), Read, Glob, Task
---

# /review-debate — Adversarial code review

## Pre-flight

```!
git diff origin/main...HEAD --stat
```

Current branch: !`git branch --show-current`

## Steps

1. **Ensure review directory exists**:
   ```
   mkdir -p .claude/.review
   ```

2. **Run defender subagent** (sonnet, read-only, no MCP):

> You are the defender. Read the current git diff against origin/main. Read the changed files in full. Find substantive strengths in the implementation. Anticipate the attacker's critiques and pre-empt them. Write your report to `.claude/.review/defender-$(date +%s).md`. Be honest — if you cannot defend something, mark it as such.

3. **Run attacker subagent** (sonnet, read-only, no MCP):

> You are the attacker. Read the current git diff against origin/main. Read the changed files in full. Assume the developer was rushed. Find every edge case, race condition, security issue, performance trap, and rule violation. Write your report to `.claude/.review/attacker-$(date +%s).md`. Cite file:line for everything.

4. **Run judge subagent** (opus, read-only):

> You are the judge. Read the most recent reports in `.claude/.review/defender-*.md` and `.claude/.review/attacker-*.md`. For each issue raised, verify against the code. For each strength claimed, verify against the code. Render a final verdict: APPROVE / APPROVE_WITH_FIXES / REJECT / NEEDS_DISCUSSION. Append a one-line lesson to `.claude/REFLECTIONS.md` if this review surfaced a generalizable pattern.

5. **Show me** the judge's verdict in full. Do NOT proceed to commit if the verdict is REJECT or NEEDS_DISCUSSION.

## Notes

- This is expensive (~3x normal review). Use only for: auth, payments, migrations, anything touching production data.
- For routine changes, use a single code review or just `git diff`.
