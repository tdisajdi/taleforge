#!/usr/bin/env bash
# PreToolUse hook, matcher: all tools.
# 작업메모장.md가 또 조용히 12,000+줄로 자라는 걸 막는 가드(2026-10-08,
# 54번 섹션의 "다음에 다시 커지면 또 분리한다"는 글로만 적힌 다짐을
# 실제로 강제하는 장치). 파일이 MEMO_LINE_LIMIT을 넘으면, 그 두 메모장
# 파일(작업메모장.md/작업메모장-완료.md) 자체를 고치는 것과 소수의
# 읽기 전용 툴을 뺀 모든 툴 호출을 막는다 -- 완료된 섹션을
# 작업메모장-완료.md로 옮기고 작업메모장.md를 다시 기준 밑으로 줄여야만
# 풀린다. memo-gate-check.sh(전체 읽기 강제)와는 별개의 독립된 가드.
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
if [ "$base" = "작업메모장.md" ] || [ "$base" = "작업메모장-완료.md" ]; then
  echo '{}'
  exit 0
fi

project_dir="${CLAUDE_PROJECT_DIR:-.}"
memo_file="$project_dir/작업메모장.md"
limit=2000

if [ ! -f "$memo_file" ]; then
  echo '{}'
  exit 0
fi

lines=$(wc -l < "$memo_file" | tr -d ' ')
if [ "$lines" -gt "$limit" ]; then
  reason="작업메모장.md가 지금 ${lines}줄로 기준(${limit}줄)을 넘었습니다 (2026-10-08, 54번 섹션에서 12,573줄까지 자랐다가 분리했던 것과 같은 문제가 재발하는 걸 막는 가드). 완료된 섹션을 작업메모장-완료.md로 옮기고 작업메모장.md를 ${limit}줄 밑으로 줄인 뒤 다시 시도하세요 -- 그 전까지는 이 두 파일을 Read/Edit/Write하는 것과 읽기 전용 툴만 허용됩니다."
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
