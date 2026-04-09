---
description: Generate a daily standup update from yesterday's git activity. Returns 3 lines: yesterday/today/blockers.
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(date:*)
---

# /standup — Daily standup generator

## Pre-flight

Yesterday's commits across all branches:
```!
git log --since='1 day ago' --author="$(git config user.email)" --oneline --all
```

Current branch:
```!
git branch --show-current
```

Modified files (uncommitted):
```!
git status --short
```

## Task

Based on the data above, write a 3-line standup update in this exact format:

```
Yesterday: <what was completed, 1 sentence>
Today: <what I'm working on, 1 sentence>
Blockers: <any blockers, or "none">
```

Be terse. Use ticket IDs from commit messages where present.
