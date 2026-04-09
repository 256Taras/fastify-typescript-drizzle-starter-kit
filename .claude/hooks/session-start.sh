#!/usr/bin/env bash
# SessionStart: injects fresh state into Claude's context.
# Updates SESSION_STATE.md with current branch, recent commits, and yesterday's git log.

set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

BRANCH="$(git branch --show-current 2>/dev/null || echo 'detached')"
LAST_COMMIT="$(git log -1 --oneline 2>/dev/null || echo 'no commits')"
SINCE_YDAY="$(git log --since='1 day ago' --oneline 2>/dev/null | head -10)"
RECENT_REFLECTIONS="$(tail -5 .claude/REFLECTIONS.md 2>/dev/null)"

cat > .claude/SESSION_STATE.md <<EOF
# Session State

## Current branch
\`$BRANCH\`

## Last commit
\`$LAST_COMMIT\`

## Commits since yesterday
\`\`\`
$SINCE_YDAY
\`\`\`

## Most recent reflections
\`\`\`
$RECENT_REFLECTIONS
\`\`\`

## Open questions
(append manually when blocked)
EOF

# Echo a summary back to Claude as additionalContext
cat <<EOF
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Session started on branch \`$BRANCH\`. Last commit: $LAST_COMMIT. Read .claude/REFLECTIONS.md and PRPs/current.md before doing work."}}
EOF

exit 0
