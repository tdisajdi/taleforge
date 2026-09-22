#!/usr/bin/env bash
# PreToolUse hook, matcher: all tools.
# Persistent (cross-session) gate: PROGRESS-AI제거.md is the detailed log,
# 작업메모장.md is the summary that "connects" to it without repeating it
# (see 작업메모장.md's own header). When PROGRESS-AI제거.md grows a new
# N탄 batch, nothing used to force anyone to go back and check whether that
# invalidates an old claim in 작업메모장.md (e.g. "디렉토리 X 아직 스윕
# 안 함") -- that's exactly how 6번 섹션 went stale (24번 섹션, 2026-09-22).
# This hook makes that check mandatory: if PROGRESS-AI제거.md's highest N탄
# number is greater than the last-synced number recorded in
# .claude/progress-sync-marker.json, every tool call except a small
# read-only allowlist (plus editing 작업메모장.md or the marker itself) is
# blocked until the marker is bumped to match.
set -euo pipefail
input="$(cat)"
tool_name="$(printf '%s' "$input" | jq -r '.tool_name // empty')"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"

case "$tool_name" in
  Read|Grep|Glob|TaskCreate|TaskUpdate|TaskList|TaskGet|ReadNotifications|AskUserQuestion|ScheduleWakeup)
    echo '{}'
    exit 0
    ;;
esac

base="$(basename -- "$file_path" 2>/dev/null || true)"
if [ "$base" = "작업메모장.md" ] || [ "$base" = "progress-sync-marker.json" ]; then
  echo '{}'
  exit 0
fi

project_dir="${CLAUDE_PROJECT_DIR:-.}"
progress_file="$project_dir/PROGRESS-AI제거.md"
marker_file="$project_dir/.claude/progress-sync-marker.json"

if [ ! -f "$progress_file" ] || [ ! -f "$marker_file" ]; then
  echo '{}'
  exit 0
fi

current_max="$(grep -oP '(?<![0-9])[0-9]{1,3}(?=탄)' "$progress_file" 2>/dev/null | sort -n | tail -1)"
[ -z "$current_max" ] && current_max=0
synced_max="$(jq -r '.lastSyncedMaxBatch // 0' "$marker_file" 2>/dev/null || echo 0)"

if [ "$current_max" -gt "$synced_max" ]; then
  reason="PROGRESS-AI제거.md에 새 항목(최고 ${current_max}탄, 마지막 동기화 ${synced_max}탄)이 추가됐습니다. 작업메모장.md의 백로그/스윕 관련 서술(특히 6번 섹션 같은 '아직 안 한 것' 목록)이 그 사이 상황이 바뀌어 낡지 않았는지 먼저 대조하세요 -- 대조 후 .claude/progress-sync-marker.json의 lastSyncedMaxBatch를 ${current_max}로 갱신하면 풀립니다."
  jq -n --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
fi

echo '{}'
