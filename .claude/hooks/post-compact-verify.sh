#!/usr/bin/env bash
set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

CRITICAL_FILES=(".claude/REFLECTIONS.md" ".claude/SESSION_STATE.md" "PRPs/current.md")
MISSING=""

for f in "${CRITICAL_FILES[@]}"; do
  [[ ! -f "$f" ]] && MISSING="${MISSING}\n- $f"
done

if [[ -n "$MISSING" ]]; then
  cat <<FEEDBACK
{"feedback":"Post-compact check: critical files missing:$MISSING\nRead these files to restore context."}
FEEDBACK
fi

exit 0
