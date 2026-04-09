#!/usr/bin/env bash
# Combined PreToolUse guard for Edit/Write/MultiEdit:
# 1. Block edits on main/master/develop/staging/production
# 2. Block edits on drizzle/migrations/** without approval marker
# 3. Block edits on .env* and key files

set -uo pipefail

INPUT="$(cat)"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')"

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Guard 1: protected branch
BRANCH="$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null || echo '')"
case "$BRANCH" in
  main|master|develop|production|staging)
    cat <<EOF >&2
{"block":true,"message":"BLOCKED: cannot edit on protected branch '$BRANCH'. Run: git checkout -b feature/<task>"}
EOF
    exit 2
    ;;
esac

# Guard 2: migrations
if [[ "$FILE_PATH" == *"/migrations/"* ]] || [[ "$FILE_PATH" == *"drizzle/migrations"* ]]; then
  if [[ ! -f "$CLAUDE_PROJECT_DIR/.claude/.migration-approved" ]]; then
    cat <<EOF >&2
{"block":true,"message":"BLOCKED: migration edit requires approval. Invoke drizzle-migration-reviewer agent first, or run /migration command. Manual override: touch .claude/.migration-approved"}
EOF
    exit 2
  fi
  rm -f "$CLAUDE_PROJECT_DIR/.claude/.migration-approved"
fi

# Guard 3: secrets
BASENAME="$(basename "$FILE_PATH")"
if [[ "$BASENAME" =~ ^\.env(\..+)?$ ]] && [[ "$BASENAME" != ".env.example" ]] && [[ "$BASENAME" != ".env.sample" ]]; then
  cat <<EOF >&2
{"block":true,"message":"BLOCKED: cannot edit secret file '$FILE_PATH'. User must update env vars manually."}
EOF
  exit 2
fi

if [[ "$BASENAME" =~ \.(pem|key|p12|pfx|jks)$ ]]; then
  cat <<EOF >&2
{"block":true,"message":"BLOCKED: cannot edit cryptographic key file '$FILE_PATH'."}
EOF
  exit 2
fi

exit 0
