#!/bin/bash
# Claude Code 클라우드 세션 시작 시 의존성 설치 (로컬에서는 아무것도 하지 않음)
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# package.json 이 있는 하위 프로젝트마다 npm 의존성 설치
for manifest in */package.json; do
  [ -f "$manifest" ] || continue
  dir="$(dirname "$manifest")"
  echo "[session-start] npm install in $dir"
  if [ -f "$dir/package-lock.json" ]; then
    (cd "$dir" && npm install --no-audit --no-fund --prefer-offline)
  else
    (cd "$dir" && npm install --no-audit --no-fund)
  fi
done

# requirements.txt 가 있는 하위 프로젝트마다 pip 의존성 설치
for manifest in */requirements.txt; do
  [ -f "$manifest" ] || continue
  echo "[session-start] pip install -r $manifest"
  pip install -q -r "$manifest"
done

exit 0
