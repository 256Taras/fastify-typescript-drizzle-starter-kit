#!/usr/bin/env bash
# Test-as-Oracle pattern: when a .lock file exists next to a test, that test cannot be edited.
# Workflow:
#   1. You write the test that defines expected behavior
#   2. touch <test>.lock
#   3. Tell Claude "implement so this passes"
#   4. Claude physically cannot cheat by editing the test
# This eliminates "test was wrong, I fixed it" hallucinations.

set -uo pipefail

INPUT="$(cat)"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')"

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Match test files
case "$FILE_PATH" in
  *.spec.ts|*.spec.js|*.test.ts|*.test.js|*.e2e-spec.ts) ;;
  *) exit 0 ;;
esac

LOCKFILE="${FILE_PATH}.lock"
if [[ -f "$LOCKFILE" ]]; then
  cat <<EOF >&2
{"block":true,"message":"TEST LOCKED: '$FILE_PATH' is the source of truth (test-as-oracle pattern).\n\nThis test defines expected behavior. You must make implementation match the test, NOT the other way around.\n\nTo unlock (only if test is genuinely wrong): rm '$LOCKFILE'"}
EOF
  exit 2
fi

exit 0
