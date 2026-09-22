#!/usr/bin/env bash
# PreToolUse hook, matcher: all tools.
# Blocks every tool call except a small read-only/status allowlist until
# 작업메모장.md has been read start-to-end this session (tracked by
# memo-gate-track.sh, reset by memo-gate-reset.sh on SessionStart/PostCompact).
# This exists because the text instruction in CLAUDE.md ("read the memo
# fully before anything else, including right after context compaction")
# was repeatedly skipped when only relying on the model to remember to
# follow it -- see 작업메모장.md 20번/24번 섹션.
set -euo pipefail
input="$(cat)"
session_id="$(printf '%s' "$input" | jq -r '.session_id // "unknown"')"
tool_name="$(printf '%s' "$input" | jq -r '.tool_name // empty')"

case "$tool_name" in
  Read|Grep|Glob|TaskCreate|TaskUpdate|TaskList|TaskGet|ReadNotifications|AskUserQuestion|ScheduleWakeup)
    echo '{}'
    exit 0
    ;;
esac

state_file="/tmp/tf-memo-gate/${session_id}.json"
fully_read="false"
if [ -f "$state_file" ]; then
  fully_read="$(jq -r '.fully_read // false' "$state_file" 2>/dev/null || echo false)"
fi

if [ "$fully_read" = "true" ]; then
  echo '{}'
  exit 0
fi

reason='CLAUDE.md 규칙: 다른 무엇보다 먼저 작업메모장.md를 처음부터 끝까지 다 읽어야 합니다. 이번 세션(또는 가장 최근 컨텍스트 압축) 이후로 그 파일을 끝까지 읽은 기록이 아직 없습니다 -- Read 툴로 /home/user/taleforge/작업메모장.md 를 offset을 이어가며 끝까지 계속 읽은 뒤 다시 시도하세요.'

jq -n --arg reason "$reason" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $reason
  }
}'
