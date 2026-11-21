#!/usr/bin/env bash
# One-command audit of the current branch. Writes /tmp/pr-audit.txt for pasting to a reviewer.
# Usage: scripts/pr-audit.sh [base-ref] [integration-runs]
#   base-ref defaults to origin/main; integration-runs defaults to 3 (use 0 to skip).
BASE="${1:-origin/main}"
RUNS="${2:-3}"
OUT=/tmp/pr-audit.txt
cd "$(git rev-parse --show-toplevel)" || exit 1
git fetch origin --quiet

summ() { grep -E "^(Test Suites|Tests):|✕|●.*›" ; }

{
  echo "### BRANCH";   git --no-pager status -sb | head -1
  echo "### STATUS (should be clean)"; git --no-pager status --short
  echo "### COMMITS";  git --no-pager log --oneline "$BASE"..HEAD
  echo "### FILES";    git --no-pager diff --stat "$BASE"...HEAD -- . ':(exclude)**/package-lock.json'
  echo "### DIFF";     git --no-pager diff "$BASE"...HEAD -- . ':(exclude)**/package-lock.json'
  echo "### PROOF"
  echo "typecheck:";   (npm --prefix server run typecheck --if-present >/dev/null 2>&1 && echo clean || echo FAILED)
  echo "lint (server):"; (npm --prefix server run lint --if-present 2>&1 | tail -3)
  echo "unit:";        (npm --prefix server run test:unit --if-present -- --silent 2>&1 | summ)
  for i in $(seq 1 "$RUNS"); do
    [ "$RUNS" -gt 0 ] || break
    echo "integration run $i:"; (npm --prefix server run test:int --if-present 2>&1 | summ)
  done
} > "$OUT" 2>&1
echo "Wrote $OUT ($(wc -l < "$OUT") lines). Paste it to your reviewer."
