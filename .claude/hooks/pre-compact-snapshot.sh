#!/usr/bin/env bash
# PreCompact: snapshots current state to disk so it survives /compact.
# Writes git diff, current files, and a brief summary to .claude/.pre-compact-snapshot/

set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

SNAPSHOT_DIR=".claude/.pre-compact-snapshot"
mkdir -p "$SNAPSHOT_DIR"

TIMESTAMP="$(date -Iseconds)"
SLUG="$(date +%Y%m%d-%H%M%S)"

# Save git state
git diff > "$SNAPSHOT_DIR/diff-$SLUG.patch" 2>/dev/null || true
git status --short > "$SNAPSHOT_DIR/status-$SLUG.txt" 2>/dev/null || true
git log --oneline -20 > "$SNAPSHOT_DIR/log-$SLUG.txt" 2>/dev/null || true

# Update SESSION_STATE.md with last compact info
cat >> .claude/SESSION_STATE.md <<EOF

## Last /compact at $TIMESTAMP
- Branch: $(git branch --show-current 2>/dev/null)
- Modified files: $(git diff --name-only 2>/dev/null | wc -l)
- Snapshot: $SNAPSHOT_DIR/diff-$SLUG.patch
EOF

# Keep only last 5 snapshots
ls -t "$SNAPSHOT_DIR"/diff-*.patch 2>/dev/null | tail -n +6 | xargs -r rm -f
ls -t "$SNAPSHOT_DIR"/status-*.txt 2>/dev/null | tail -n +6 | xargs -r rm -f
ls -t "$SNAPSHOT_DIR"/log-*.txt 2>/dev/null | tail -n +6 | xargs -r rm -f

cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PreCompact","additionalContext":"State snapshotted to $SNAPSHOT_DIR/diff-$SLUG.patch. Resume context from .claude/SESSION_STATE.md after compact."}}
EOF

exit 0
