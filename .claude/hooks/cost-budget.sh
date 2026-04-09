#!/usr/bin/env bash
# UserPromptSubmit: track daily prompt count, soft warnings at thresholds.
# Hard cap optional via env var CLAUDE_DAILY_HARD_CAP.

set -uo pipefail

TRACKER="$CLAUDE_PROJECT_DIR/.claude/.cost-tracker"
TODAY="$(date +%Y-%m-%d)"

[[ -f "$TRACKER" ]] || echo "$TODAY:0" > "$TRACKER"

STORED_DATE="$(cut -d: -f1 "$TRACKER")"
STORED_COUNT="$(cut -d: -f2 "$TRACKER")"

[[ "$STORED_DATE" != "$TODAY" ]] && STORED_COUNT=0

NEW_COUNT=$((STORED_COUNT + 1))
echo "$TODAY:$NEW_COUNT" > "$TRACKER"

HARD_CAP="${CLAUDE_DAILY_HARD_CAP:-0}"

if [[ "$HARD_CAP" -gt 0 ]] && [[ "$NEW_COUNT" -gt "$HARD_CAP" ]]; then
  cat <<EOF >&2
{"block":true,"message":"HARD CAP REACHED: $NEW_COUNT prompts today (cap=$HARD_CAP). Take a break. Set CLAUDE_DAILY_HARD_CAP=0 to disable."}
EOF
  exit 2
fi

case "$NEW_COUNT" in
  50) echo '{"feedback":"50 prompts today. /clear if switching tasks."}' ;;
  100) echo '{"feedback":"100 prompts. Heavy day. Use Plan Mode for routine."}' ;;
  150) echo '{"feedback":"150 prompts. You are in burn territory."}' ;;
  200) echo '{"feedback":"200 prompts. Stop and resume tomorrow."}' ;;
esac

exit 0
