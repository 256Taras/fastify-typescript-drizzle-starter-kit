#!/usr/bin/env bash
# PreToolUse guard for Bash: blocks destructive and dangerous commands.

set -uo pipefail

INPUT="$(cat)"
COMMAND="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

block() {
  local reason="$1"
  cat <<EOF >&2
{"block":true,"message":"BLOCKED: $reason\nCommand: $COMMAND"}
EOF
  exit 2
}

# Force push
echo "$COMMAND" | grep -qE '\bgit\s+push\s+.*(-f|--force)\b' && \
  block "git push --force is forbidden. Rewriting shared history is not allowed."

# Push to protected
echo "$COMMAND" | grep -qE '\bgit\s+push\s+\S+\s+(main|master|production)' && \
  block "Direct push to protected branch. Open a Merge Request."

# Destructive
echo "$COMMAND" | grep -qE '\brm\s+-rf\s+/' && block "rm -rf / variant detected"
echo "$COMMAND" | grep -qE '\brm\s+-rf\s+~' && block "rm -rf home detected"
echo "$COMMAND" | grep -qE '\bdd\s+if=.*of=/dev/' && block "dd to device detected"
echo "$COMMAND" | grep -qE '\bmkfs\.' && block "filesystem format detected"
echo "$COMMAND" | grep -qiE 'DROP\s+(DATABASE|SCHEMA|TABLE)' && block "destructive SQL detected"
echo "$COMMAND" | grep -qiE 'TRUNCATE\s+TABLE' && block "TRUNCATE TABLE detected"
echo "$COMMAND" | grep -qE ':\(\)\s*\{\s*:\|:&\s*\}\s*;:' && block "fork bomb detected"

# Package manager other than pnpm
echo "$COMMAND" | grep -qE '^\s*(npm|yarn)\s+(install|add|i\s)' && \
  block "Use pnpm, not npm/yarn (project rule)"

exit 0
