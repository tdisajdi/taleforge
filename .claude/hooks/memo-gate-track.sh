#!/usr/bin/env bash
# PostToolUse hook, matcher: Read.
# Every time 작업메모장.md is Read (whatever offset/limit was used), records
# that line range and merges it into the session's cumulative coverage.
# Once cumulative coverage reaches (total lines - margin), marks the memo
# as "fully read" for this session so the PreToolUse gate opens up.
set -euo pipefail
input="$(cat)"
session_id="$(printf '%s' "$input" | jq -r '.session_id // "unknown"')"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"

if [ -z "$file_path" ] || [ "$(basename -- "$file_path")" != "작업메모장.md" ] || [ ! -f "$file_path" ]; then
  echo '{}'
  exit 0
fi

total_lines=$(wc -l < "$file_path" | tr -d ' ')
offset="$(printf '%s' "$input" | jq -r '.tool_input.offset // 1')"
limit="$(printf '%s' "$input" | jq -r '.tool_input.limit // 2000')"
[ "$offset" -lt 1 ] 2>/dev/null && offset=1
end_line=$(( offset + limit - 1 ))
if [ "$end_line" -gt "$total_lines" ]; then end_line=$total_lines; fi

state_dir="/tmp/tf-memo-gate"
mkdir -p "$state_dir"
state_file="$state_dir/${session_id}.json"
[ -f "$state_file" ] || echo '{"ranges":[]}' > "$state_file"

margin=20
jq --argjson off "$offset" --argjson end "$end_line" --argjson total "$total_lines" --argjson margin "$margin" '
  .ranges += [[$off, $end]]
  | .ranges |= (sort_by(.[0]) | reduce .[] as $iv ([];
      if length == 0 then [$iv]
      else
        .[-1] as $last |
        if $iv[0] <= ($last[1] + 1) then
          .[0:-1] + [[$last[0], (if $iv[1] > $last[1] then $iv[1] else $last[1] end)]]
        else
          . + [$iv]
        end
      end))
  | .covered = ([.ranges[] | (.[1]-.[0]+1)] | add)
  | .total = $total
  | .fully_read = (($total - .covered) <= $margin)
' "$state_file" > "${state_file}.tmp" && mv "${state_file}.tmp" "$state_file"

echo '{}'
