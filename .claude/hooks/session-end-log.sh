#!/usr/bin/env bash
set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

TIMESTAMP="$(date -Iseconds)"
BRANCH="$(git branch --show-current 2>/dev/null || echo 'detached')"
CHANGED="$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')"
UNCOMMITTED="$(git status --short 2>/dev/null | wc -l | tr -d ' ')"

mkdir -p .claude/.logs

cat >> .claude/.logs/sessions.log <<LOG
[$TIMESTAMP] branch=$BRANCH changed=$CHANGED uncommitted=$UNCOMMITTED
LOG

tail -100 .claude/.logs/sessions.log > .claude/.logs/sessions.log.tmp
mv .claude/.logs/sessions.log.tmp .claude/.logs/sessions.log

exit 0
