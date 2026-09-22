#!/usr/bin/env bash
# SessionStart / PostCompact hook.
# Clears this session's "memo fully read" progress so the PreToolUse gate
# (memo-gate-check.sh) blocks again until 작업메모장.md is read start-to-end
# again. Runs on real session start AND right after a context compaction,
# because compaction is exactly the moment the model's working memory of
# the memo gets replaced by a summary and CLAUDE.md's "read it again" rule
# has historically been the one most likely to get skipped.
set -euo pipefail
input="$(cat)"
session_id="$(printf '%s' "$input" | jq -r '.session_id // "unknown"')"
rm -f "/tmp/tf-memo-gate/${session_id}.json"
echo '{}'
