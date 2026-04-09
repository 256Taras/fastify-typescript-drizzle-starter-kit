---
description: Create a git worktree for parallel development. Use when you want two Claude sessions working on different features simultaneously.
allowed-tools: Bash(git worktree:*), Bash(git branch:*), Bash(ls:*), Bash(cd:*)
argument-hint: <branch-name>
---

# /worktree — Parallel development setup

Branch name: `$ARGUMENTS`

## Steps

1. Check if branch exists:
   ```!
   git branch --list "$ARGUMENTS"
   ```

2. Create the worktree at `../$(basename $(pwd))-$ARGUMENTS`:
   ```
   git worktree add ../$(basename $(pwd))-$ARGUMENTS -b $ARGUMENTS
   ```

3. Show me the worktree path and instruct me to:
   ```
   cd ../$(basename $(pwd))-$ARGUMENTS
   claude
   ```

4. Tell me to start a second Claude session in the worktree. The two sessions will not interfere — different filesystems, different `.claude/.cost-tracker`.

## Notes

- Worktrees share git history but have separate working directories
- Both sessions will read the same `CLAUDE.md` (it's shared via git)
- Both will write to the same `.claude/REFLECTIONS.md` — that's fine, append-only
- To remove the worktree later: `git worktree remove ../$(basename $(pwd))-$ARGUMENTS`
