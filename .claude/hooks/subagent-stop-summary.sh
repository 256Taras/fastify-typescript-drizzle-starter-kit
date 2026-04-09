#!/usr/bin/env bash
# SubagentStop: logs which subagent ran and when.
# Useful for spotting runaway agents.

set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

INPUT="$(cat)"
AGENT_NAME="$(echo "$INPUT" | jq -r '.subagent_name // "unknown"')"
TIMESTAMP="$(date -Iseconds)"

mkdir -p .claude/.logs
echo "$TIMESTAMP $AGENT_NAME" >> .claude/.logs/subagents.log

# Keep last 200 entries
tail -200 .claude/.logs/subagents.log > .claude/.logs/subagents.log.tmp
mv .claude/.logs/subagents.log.tmp .claude/.logs/subagents.log

exit 0
