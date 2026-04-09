#!/usr/bin/env bash
# PostToolUseFailure: when a tool fails, prompt Claude to write a reflection.
# This is the self-learning loop. Failure is data.

set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

INPUT="$(cat)"
TOOL="$(echo "$INPUT" | jq -r '.tool_name // "unknown"')"
ERROR="$(echo "$INPUT" | jq -r '.tool_response.error // .tool_response.stderr // ""' | head -200)"

if [[ -z "$ERROR" ]]; then
  exit 0
fi

# Send feedback to Claude prompting reflexion
cat <<EOF
{"feedback":"Tool $TOOL failed.\n\nError snippet:\n$ERROR\n\nREFLEXION REQUIRED: After fixing this, append ONE line to .claude/REFLECTIONS.md in format:\n[$(date +%Y-%m-%d)] [domain] one-sentence lesson, present-tense imperative.\n\nDo this BEFORE moving on. The lesson should help future-you avoid this exact mistake."}
EOF

exit 0
